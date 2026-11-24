from pydantic import BaseModel, Field, FiniteFloat

from ..helpers import TypeIdModel
from ..shape import ApiShape
from .background import *
from .type import *
from .visible import *


class ApiGroup(BaseModel):
    uuid: str
    character_set: str
    creation_order: str


class ApiExploredRegion(BaseModel):
    key: str = Field(min_length=1, max_length=64)
    points: list[tuple[FiniteFloat, FiniteFloat]] = Field(min_length=3, max_length=8192)


class ApiLayer(TypeIdModel):
    name: str = Field(json_schema_extra={"typeId": "LayerName"})
    type_: str
    player_editable: bool
    selectable: bool
    index: int
    shapes: list[ApiShape]
    groups: list[ApiGroup]


class ApiFloor(TypeIdModel):
    index: int
    name: str
    player_visible: bool
    type_: int
    background_color: str | None
    layers: list[ApiLayer]
    explored_regions: list[ApiExploredRegion] = Field(default_factory=list)


class FogExploredUpdate(BaseModel):
    floor: str
    regions: list[ApiExploredRegion] = Field(min_length=1, max_length=4)


class FloorCreate(BaseModel):
    floor: ApiFloor
    creator: str


class FloorRename(TypeIdModel):
    index: int = Field(json_schema_extra={"typeId": "FloorIndex"})
    name: str
