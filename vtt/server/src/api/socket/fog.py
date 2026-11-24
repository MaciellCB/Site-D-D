import json
from typing import Any

from pydantic import ValidationError

from ... import auth
from ...api.helpers import _send_game
from ...api.models.floor import FogExploredUpdate
from ...app import app, sio
from ...db.db import db
from ...db.models.explored_region import ExploredRegion
from ...db.models.floor import Floor
from ...db.models.player_room import PlayerRoom
from ...logs import logger
from ...models.role import Role
from ...state.game import game_state
from .constants import GAME_NS


@sio.on("Fog.Explored.Update", namespace=GAME_NS)
@auth.login_required(app, sio, "game")
async def update_explored_regions(sid: str, raw_data: Any):
    pr: PlayerRoom = game_state.get(sid)

    try:
        data = FogExploredUpdate.model_validate(raw_data)
    except ValidationError as error:
        logger.warning(f"User {pr.player.name} sent invalid explored fog data: {error.errors()}")
        return

    if pr.role != Role.DM:
        logger.warning(f"{pr.player.name} attempted to update explored fog without GM permissions")
        return

    floor = Floor.get_or_none(location=pr.active_location, name=data.floor)
    if floor is None:
        logger.warning(f"{pr.player.name} attempted to update explored fog on an unknown floor")
        return

    with db.atomic():
        ExploredRegion.insert_many(
            [
                {"floor": floor, "key": region.key, "points": json.dumps(region.points)}
                for region in data.regions
            ]
        ).on_conflict_ignore().execute()

    await _send_game("Fog.Explored.Update", data, room=pr.active_location.get_path())
