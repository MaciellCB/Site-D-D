from typing import cast

from peewee import ForeignKeyField, TextField

from ..base import BaseDbModel
from .floor import Floor


class ExploredRegion(BaseDbModel):
    floor = cast(Floor, ForeignKeyField(Floor, backref="explored_regions", on_delete="CASCADE"))
    key = cast(str, TextField())
    points = cast(str, TextField())

    class Meta:  # pyright: ignore [reportIncompatibleVariableOverride]
        indexes = ((("floor", "key"), True),)
