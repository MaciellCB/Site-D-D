from typing import Literal

from pydantic import Field

from ..helpers import TypeIdModel

CONDITION_IDS = frozenset({
    "blinded", "charmed", "deafened", "frightened", "grappled", "incapacitated",
    "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained",
    "stunned", "unconscious", "exhaustion", "concentrating",
})


class ApiCharacter(TypeIdModel):
    id: int = Field(json_schema_extra={"typeId": "CharacterId"})
    name: str
    shapeId: str = Field(json_schema_extra={"typeId": "GlobalId"})
    assetId: int = Field(json_schema_extra={"typeId": "AssetId"})
    assetHash: str


class CharacterCreate(TypeIdModel):
    shape: str = Field(json_schema_extra={"typeId": "GlobalId"})


class CharacterConditionToggle(TypeIdModel):
    shape: str = Field(json_schema_extra={"typeId": "GlobalId"})
    characterId: str
    condition: Literal[
        "blinded", "charmed", "deafened", "frightened", "grappled", "incapacitated",
        "invisible", "paralyzed", "petrified", "poisoned", "prone", "restrained",
        "stunned", "unconscious", "exhaustion", "concentrating",
    ]
    active: bool
