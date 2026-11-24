import asyncio
import os
import random
import secrets

import aiohttp
import jwt
from aiohttp import web
from aiohttp_security import authorized_userid, forget, remember

from ... import stats
from ...api.helpers import _send_game
from ...api.models.character import CONDITION_IDS
from ...logs import logger
from ...auth import get_authorized_user
from ...config import cfg
from ...db.db import db
from ...db.models.location import Location
from ...db.models.player_room import PlayerRoom
from ...db.models.room import Room
from ...db.models.shape import Shape
from ...db.models.shape_owner import ShapeOwner
from ...db.models.tracker import Tracker
from ...db.models.user import User
from ...mail import send_mail
from ...state.auth import auth_state


async def is_authed(request):
    user = await get_authorized_user(request)

    if user is None:
        data = {"auth": False, "username": ""}
    else:
        data = {"auth": True, "username": user.name, "email": user.email}
        user.update_last_login()
    return web.json_response(data)


async def login(request):
    try:
        user = await get_authorized_user(request)
    except web.HTTPUnauthorized:
        pass
    else:
        return web.json_response({"email": user.email})

    data = await request.json()
    username = data["username"]
    password = data["password"]
    u = User.by_name(username)
    if u is None or not u.check_password(password):
        return web.HTTPUnauthorized(reason="Username and/or Password do not match")
    response = web.json_response({"email": u.email})
    u.update_last_login()
    await remember(request, response, username)
    return response


async def register(request):
    if not cfg().general.allow_signups:
        return web.HTTPForbidden()

    if await authorized_userid(request) is not None:
        return web.HTTPOk()

    data = await request.json()
    username = data["username"]
    password = data["password"]
    email = data.get("email", None)
    if User.by_name(username):
        return web.HTTPConflict(reason="Username already taken")
    elif not username:
        return web.HTTPBadRequest(reason="Please provide a username")
    elif not password:
        return web.HTTPBadRequest(reason="Please provide a password")
    else:
        try:
            with db.atomic():
                user = User.create_new(username, password, email)
                stats.events.user_created(user.id)
        except:
            return web.HTTPServerError(
                reason="An unexpected error occured on the server during account creation.  Operation reverted."
            )
        response = web.HTTPOk()
        user.update_last_login()
        await remember(request, response, username)
        return response


async def logout(request):
    response = web.HTTPOk()
    await forget(request, response)
    return response


async def forgot_password(request):
    data = await request.json()
    email = data["email"]
    user = User.by_email(email)

    # If the email is not found,
    # we just return a 200 to avoid leaking information
    if user is None:
        await asyncio.sleep(random.randint(1, 5))
        return web.HTTPOk()

    reset_token = auth_state.add_reset_token(user.id)

    reset_url = f"{cfg().general.client_url}/auth/login?resetToken={reset_token}"

    # Send the email
    if not send_mail(
        "Password reset request",
        f"A password reset for the PlanarAlly account associated with this email address was requested. Visit {reset_url} to reset your password. If you did not do this, please ignore this email.",
        f"A password reset for the PlanarAlly account associated with this email address was requested. Visit <a href='{reset_url}'>{reset_url}</a> to reset your password.<br><br>If you did not do this, please ignore this email.",
        [email],
    ):
        return web.HTTPInternalServerError(reason="Failed to send email - check with your administrator")

    return web.HTTPOk()


async def reset_password(request):
    data = await request.json()
    token = data["token"]
    password = data["password"]

    uid = auth_state.get_uid_from_token(token)
    if uid is None:
        return web.HTTPNotFound()

    user = User.get_by_id(uid)
    user.set_password(password)
    user.save()

    return web.HTTPOk()


SSO_SECRET = os.getenv("SSO_SECRET", "chave_secreta_dndchan_2026")
DNDCHAN_INTERNAL_URL = os.getenv("DNDCHAN_INTERNAL_URL", "").rstrip("/")
async def sync_condition_to_site(data: dict) -> bool:
    if not DNDCHAN_INTERNAL_URL:
        logger.warning("DNDCHAN_INTERNAL_URL nao configurada; condicao nao sincronizada com a ficha.")
        return False

    try:
        timeout = aiohttp.ClientTimeout(total=5)
        async with aiohttp.ClientSession(timeout=timeout) as client:
            async with client.post(
                f"{DNDCHAN_INTERNAL_URL}/api/sync-condition",
                json=data,
                headers={"Authorization": f"Bearer {SSO_SECRET}"},
            ) as response:
                if not response.ok:
                    logger.warning(
                        f"Site rejeitou a sincronizacao da condicao (HTTP {response.status}): "
                        f"{await response.text()}"
                    )
                    return False
        return True
    except (aiohttp.ClientError, asyncio.TimeoutError):
        logger.exception("Falha ao sincronizar condicao com o site.")
        return False


async def sso_login(request: web.Request) -> web.Response:
    token = request.query.get("token")
    redirect_to = request.query.get("redirect", "/")
    if not token:
        return web.HTTPBadRequest(text="Token SSO ausente")

    try:
        payload = jwt.decode(token, SSO_SECRET, algorithms=["HS256"])
        username = payload["username"]
    except jwt.InvalidTokenError:
        return web.HTTPUnauthorized(text="Token SSO invalido ou expirado")

    u = User.by_name(username)
    if u is None:
        with db.atomic():
            u = User.create_new(username, secrets.token_urlsafe(32), f"{username}@dndchan.local")
            stats.events.user_created(u.id)

    response = web.HTTPFound(redirect_to)
    u.update_last_login()
    await remember(request, response, username)
    return response


async def sync_ficha(request: web.Request) -> web.Response:
    auth_header = request.headers.get("Authorization", "")
    if auth_header != f"Bearer {SSO_SECRET}":
        return web.HTTPUnauthorized(text="Nao autorizado")

    data = await request.json()
    if not isinstance(data, dict):
        return web.HTTPBadRequest(text="Dados da ficha invalidos")
    personagem = data.get("personagem") or data.get("nome")
    if not personagem:
        return web.HTTPBadRequest(text="Nome do personagem ausente")

    character_id = data.get("characterId")
    conditions = data.get("conditions", [])
    if (
        (character_id is not None and (not isinstance(character_id, str) or not character_id.strip()))
        or not isinstance(conditions, list)
        or any(not isinstance(condition, str) or condition not in CONDITION_IDS for condition in conditions)
    ):
        return web.HTTPBadRequest(text="Dados de condicoes invalidos")

    conditions = list(dict.fromkeys(conditions))
    vida_atual = int(data.get("vidaAtual", 0))
    vida_max = int(data.get("vidaTotalCalculada", 10))
    vida_temp = int(data.get("vidaTempAtual", 0))

    shapes = Shape.select().where(Shape.name ** personagem)
    updated_count = 0

    for shape in shapes:
        location_room = shape.layer.floor.location.get_path()
        if character_id:
            shape_options = shape.get_options()
            shape_options["dndchanCharacterId"] = character_id
            shape_options["dndchanConditions"] = conditions
            shape.set_options(shape_options)
            shape.save()
            if shape.layer is not None:
                await _send_game(
                    "Character.Condition.Sync",
                    {
                        "shape": shape.uuid,
                        "characterId": character_id,
                        "conditions": conditions,
                    },
                    room=location_room,
                )

        hp_tracker, created = Tracker.get_or_create(
            shape=shape,
            name="HP",
            defaults={
                "uuid": secrets.token_hex(16),
                "visible": True,
                "value": vida_atual,
                "maxvalue": vida_max,
                "draw": True,
                "primary_color": "#e53935",
                "secondary_color": "#4a1515",
                "index": 0,
            },
        )
        if not created:
            hp_tracker.value = vida_atual
            hp_tracker.maxvalue = vida_max
            hp_tracker.save()

        await _send_game(
            "Shape.Options.Tracker.Create" if created else "Shape.Options.Tracker.Update",
            hp_tracker.as_pydantic(),
            room=location_room,
        )

        temp_tracker = Tracker.get_or_none(shape=shape, name="HP Temp")
        if temp_tracker or vida_temp > 0:
            temp_created = False
            if temp_tracker is None:
                temp_created = True
                temp_tracker = Tracker.create(
                    uuid=secrets.token_hex(16),
                    shape=shape,
                    visible=True,
                    name="HP Temp",
                    value=vida_temp,
                    maxvalue=max(vida_temp, 1),
                    draw=True,
                    primary_color="#00acc1",
                    secondary_color="#004d40",
                    index=1,
                )
            else:
                temp_tracker.value = vida_temp
                if vida_temp > temp_tracker.maxvalue:
                    temp_tracker.maxvalue = vida_temp
                temp_tracker.save()

            await _send_game(
                "Shape.Options.Tracker.Create" if temp_created else "Shape.Options.Tracker.Update",
                temp_tracker.as_pydantic(),
                room=location_room,
            )

        updated_count += 1

    return web.json_response({"ok": True, "tokens_atualizados": updated_count})


async def sync_condition(request: web.Request) -> web.Response:
    auth_header = request.headers.get("Authorization", "")
    if auth_header != f"Bearer {SSO_SECRET}":
        return web.HTTPUnauthorized(text="Nao autorizado")

    data = await request.json()
    if not isinstance(data, dict):
        return web.HTTPBadRequest(text="Dados de condicao invalidos")
    character_id = data.get("characterId")
    token_id = data.get("tokenId")
    condition = data.get("condition")
    active = data.get("active")
    if (
        not isinstance(character_id, str)
        or not character_id.strip()
        or not isinstance(token_id, str)
        or not token_id.strip()
        or not isinstance(condition, str)
        or condition not in CONDITION_IDS
        or len(token_id) > 128
        or not isinstance(active, bool)
    ):
        return web.HTTPBadRequest(text="Dados de condicao invalidos")

    shape = Shape.get_or_none(Shape.uuid == token_id)
    if shape is None:
        return web.HTTPNotFound(text="Token nao encontrado")

    shape_options = shape.get_options()
    if shape_options.get("dndchanCharacterId") != character_id:
        return web.HTTPForbidden(text="Token nao associado a esta ficha")

    conditions = shape_options.get("dndchanConditions", [])
    if not isinstance(conditions, list):
        conditions = []
    current_conditions = {
        condition_id for condition_id in conditions
        if isinstance(condition_id, str) and condition_id in CONDITION_IDS
    }
    if active:
        current_conditions.add(condition)
    else:
        current_conditions.discard(condition)
    updated_conditions = sorted(current_conditions)

    shape_options["dndchanConditions"] = updated_conditions
    shape.set_options(shape_options)
    shape.save()

    if shape.layer is not None:
        await _send_game(
            "Character.Condition.Toggle",
            {
                "shape": shape.uuid,
                "characterId": character_id,
                "condition": condition,
                "active": active,
            },
            room=shape.layer.floor.location.get_path(),
        )

    site_synced = await sync_condition_to_site({
        "characterId": character_id,
        "condition": condition,
        "active": active,
        "tokenId": token_id,
    })
    return web.json_response({"ok": True, "site_synced": site_synced})


async def list_mapas(request: web.Request) -> web.Response:
    auth_header = request.headers.get("Authorization", "")
    if auth_header != f"Bearer {SSO_SECRET}":
        return web.HTTPUnauthorized(text="Nao autorizado")

    resultado = []
    for room in Room.select():
        locations = []
        for loc in Location.select().where(Location.room == room):
            tokens = []
            for floor in loc.floors:
                for layer in floor.layers:
                    for shape in layer.shapes:
                        if shape.name:
                            tokens.append({"uuid": shape.uuid, "name": shape.name})
            locations.append({
                "id": loc.id,
                "name": loc.name,
                "tokens": tokens,
            })

        resultado.append({
            "room_id": room.id,
            "creator": room.creator.name,
            "room_name": room.name,
            "redirect_path": f"/game/{room.creator.name}/{room.name}",
            "locations": locations,
        })

    return web.json_response({"mapas": resultado})


async def associar_personagem_mapa(request: web.Request) -> web.Response:
    auth_header = request.headers.get("Authorization", "")
    if auth_header != f"Bearer {SSO_SECRET}":
        return web.HTTPUnauthorized(text="Nao autorizado")

    data = await request.json()
    username = data.get("username")
    personagem = data.get("personagem")
    creator = data.get("creator")
    room_name = data.get("room_name")
    location_id = data.get("location_id")

    if not username or not creator or not room_name:
        return web.HTTPBadRequest(text="username, creator e room_name sao obrigatorios")

    creator_user = User.by_name(creator)
    if not creator_user:
        return web.HTTPNotFound(text="Criador da sala nao encontrado")

    room = Room.get_or_none(creator=creator_user, name=room_name)
    if not room:
        return web.HTTPNotFound(text="Sala nao encontrada")

    player = User.by_name(username)
    if not player:
        with db.atomic():
            player = User.create_new(username, secrets.token_urlsafe(32), f"{username}@dndchan.local")
            stats.events.user_created(player.id)

    target_loc = Location.get_or_none(id=location_id, room=room) if location_id else Location.get_or_none(room=room)
    if not target_loc:
        return web.HTTPNotFound(text="Grid/Location nao encontrado")

    from ...db.models.layer import Layer
    from ...db.models.location_user_option import LocationUserOption
    from ...db.models.user_options import UserOptions

    pr = PlayerRoom.get_or_none(player=player, room=room)
    if pr is None:
        u_opt = UserOptions.create()
        pr = PlayerRoom.create(player=player, room=room, role=0, active_location=target_loc, user_options=u_opt)
    elif pr.active_location != target_loc:
        pr.active_location = target_loc
        pr.save()

    default_layer = Layer.get_or_none(floor=target_loc.floors[0], name="tokens") or target_loc.floors[0].layers[0]
    LocationUserOption.get_or_create(
        user=player,
        location=target_loc,
        defaults={"active_layer": default_layer},
    )

    tokens_vinculados = 0
    if personagem:
        for shape in Shape.select().where(Shape.name ** personagem):
            if shape.layer and shape.layer.floor.location.id == target_loc.id:
                ShapeOwner.get_or_create(
                    shape=shape,
                    user=player,
                    defaults={"edit_access": True, "movement_access": True, "vision_access": True},
                )
                tokens_vinculados += 1

    return web.json_response({
        "ok": True,
        "redirect_path": f"/game/{room.creator.name}/{room.name}",
        "location": target_loc.name,
        "tokens_vinculados": tokens_vinculados,
    })


async def revogar_acesso_mapa(request: web.Request) -> web.Response:
    auth_header = request.headers.get("Authorization", "")
    if auth_header != f"Bearer {SSO_SECRET}":
        return web.HTTPUnauthorized(text="Nao autorizado")

    data = await request.json()
    username = data.get("username")
    personagem = data.get("personagem")
    creator = data.get("creator")
    room_name = data.get("room_name")
    location_id = data.get("location_id")
    scope = data.get("scope", "room")
    preserve_location_ids = data.get("preserve_location_ids", [])

    if not all(isinstance(value, str) and value.strip() for value in (username, personagem, creator, room_name)):
        return web.HTTPBadRequest(text="username, personagem, creator e room_name sao obrigatorios")
    if not isinstance(location_id, int) or isinstance(location_id, bool):
        return web.HTTPBadRequest(text="location_id invalido")
    if scope not in ("location", "room"):
        return web.HTTPBadRequest(text="scope invalido")
    if not isinstance(preserve_location_ids, list) or any(
        not isinstance(value, int) or isinstance(value, bool) for value in preserve_location_ids
    ):
        return web.HTTPBadRequest(text="preserve_location_ids invalido")

    player = User.by_name(username.strip())
    if not player:
        return web.HTTPNotFound(text="Usuario do PlanarAlly nao encontrado")

    creator_user = User.by_name(creator.strip())
    if not creator_user:
        return web.HTTPNotFound(text="Criador da sala nao encontrado")

    room = Room.get_or_none(creator=creator_user, name=room_name.strip())
    if not room:
        return web.HTTPNotFound(text="Sala nao encontrada")

    target_loc = Location.get_or_none(id=location_id, room=room)
    if not target_loc:
        return web.HTTPNotFound(text="Grid/Location nao encontrado")

    preserve_locations = set(preserve_location_ids)
    tokens_revogados = 0
    for shape in Shape.select().where(Shape.name ** personagem.strip()):
        if not shape.layer:
            continue
        shape_location = shape.layer.floor.location
        if shape_location.room_id != room.id:
            continue
        if shape_location.id in preserve_locations:
            continue
        if scope == "location" and shape_location.id != target_loc.id:
            continue

        owner = ShapeOwner.get_or_none(shape=shape, user=player)
        if owner is None:
            continue

        ShapeOwner.delete().where((ShapeOwner.shape == shape) & (ShapeOwner.user == player)).execute()
        await _send_game(
            "Shape.Owner.Delete",
            {"shape": shape.uuid, "user": player.name},
            room=shape_location.get_path(),
        )
        tokens_revogados += 1

    return web.json_response({"ok": True, "tokens_revogados": tokens_revogados})
