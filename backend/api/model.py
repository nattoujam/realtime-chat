from typing import List
from pydantic import BaseModel

class User(BaseModel):
    name: str


class Room(BaseModel):
    name: str
    host: User
    members: List[User]