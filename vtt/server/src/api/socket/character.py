from typing import Any, cast

from pydantic import ValidationError

from ... import auth
from ...api.socket.constants import GAME_NS
from ...app import app, sio
from ...db.models.asset_rect import AssetRect
from ...db.models.character import Character
from ...db.models.player_room import PlayerRoom
from ...db.models.shape import Shape
from ...logs import logger
from ...models.access import has_ownership
from ...state.game import game_state
from ..http.auth import sync_condition_to_site
from ..helpers import _send_game
from ..models.character import CONDITION_IDS, CharacterConditionToggle, CharacterCreate


async def send_character_update(pr: PlayerRoom, character: Character):
    shape = character.shape
    data = character.as_pydantic()
    for psid, ppr in game_state.get_t(room=pr.room):
        if has_ownership(shape, ppr, edit=True):
            await _send_game("Character.Updated", data, room=psid)


@sio.on("Character.Create", namespace=GAME_NS)
@auth.login_required(app, sio, "game")
async def create_character(sid: str, raw_data: Any):
    data = CharacterCreate(**raw_data)

    pr = game_state.get(sid)

    shape = Shape.get_or_none(Shape.uuid == data.shape)

    if shape is None or shape.type_ != "assetrect":
        logger.error("Attempt to create character for incorrect shape")
        return
    ar = cast(AssetRect, shape.subtype)

    if ar is None or ar.asset is None:
        logger.error("Attempt to create character for incorrect asset")
        return
    if not has_ownership(shape, pr, edit=True):
        logger.warning("Attempt to create character without access")
        return
    elif shape.character is not None:
        logger.warning("Shape is already associated with a character")
        return

    try:
        char = Character.create(shape=shape, campaign=pr.room)
    except:
        logger.exception("Failed to create character")
        return

    for psid, ppr in game_state.get_t(room=pr.room):
        if has_ownership(shape, ppr, edit=True):
            await _send_game(
                "Character.Created",
                char.as_pydantic(),
                room=psid,
            )


@sio.on("Character.Remove", namespace=GAME_NS)
@auth.login_required(app, sio, "game")
async def remove_character(sid: str, char_id: int):
    pr = game_state.get(sid)

    character = Character.get_or_none(Character.id == char_id)

    if character is None:
        logger.error("Attempt to remove unknown character")
        return
    elif character.campaign != pr.room:
        logger.error("Attempt to remove character from other campaign")
        return

    shape = character.shape

    if not has_ownership(shape, pr, edit=True):
        logger.error("Attempt to remove character by player without access")
        return

    for psid, ppr in game_state.get_t(room=pr.room):
        if has_ownership(shape, ppr, edit=True):
            await _send_game(
                "Character.Removed",
                char_id,
                room=psid,
            )

    character.delete_instance(True)

    # If the associated shape is not placed anywhere, remove it as well
    if shape.layer is None:
        shape.delete_instance(True)


@sio.on("Character.Condition.Toggle", namespace=GAME_NS)
@auth.login_required(app, sio, "game")
async def toggle_character_condition(sid: str, raw_data: Any):
    try:
        data = CharacterConditionToggle.model_validate(raw_data)
    except ValidationError as error:
        logger.warning(f"Invalid condition toggle request: {error.errors()}")
        return {"ok": False, "error": "invalid_request"}

    pr: PlayerRoom = game_state.get(sid)
    shape = Shape.get_or_none(Shape.uuid == data.shape)
    if shape is None or shape.layer is None:
        return {"ok": False, "error": "token_not_found"}
    if not has_ownership(shape, pr, edit=True):
        logger.warning("Attempt to toggle a character condition without edit access")
        return {"ok": False, "error": "forbidden"}

    try:
        options = shape.get_options()
    except (TypeError, ValueError):
        logger.exception("Could not read token options for condition toggle")
        return {"ok": False, "error": "invalid_token_options"}

    if options.get("dndchanCharacterId") != data.characterId:
        return {"ok": False, "error": "character_mismatch"}

    conditions = options.get("dndchanConditions", [])
    if not isinstance(conditions, list):
        conditions = []
    current_conditions = {
        condition for condition in conditions
        if isinstance(condition, str) and condition in CONDITION_IDS
    }
    if data.active:
        current_conditions.add(data.condition)
    else:
        current_conditions.discard(data.condition)

    options["dndchanConditions"] = sorted(current_conditions)
    shape.set_options(options)
    shape.save()

    update = data.model_dump()
    await _send_game("Character.Condition.Toggle", update, room=shape.layer.floor.location.get_path())
    site_synced = await sync_condition_to_site({
        "characterId": data.characterId,
        "condition": data.condition,
        "active": data.active,
        "tokenId": data.shape,
    })
    return {"ok": True, "siteSynced": site_synced}
