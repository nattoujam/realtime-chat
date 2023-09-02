from typing import List
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from starlette.websockets import WebSocket, WebSocketDisconnect
from logging import getLogger
from rich.logging import RichHandler
from .model import User, Room
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    'http://localhost:5173'
]

app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

clients = dict()
users = list()
rooms = list()

log = getLogger('uvicorn')
# log.addHandler(RichHandler())


@app.get("/test/{id}")
async def test(id: int):
    return JSONResponse(content={'id': id}, status_code=201)


@app.post("/login", response_model=User)
async def login(user: User):
    users.append(user)
    response = {"id": len(users), **(user.dict())}
    log.info(f"login user: {user}")
    return JSONResponse(content=response, status_code=201)


@app.post("/rooms", response_model=Room)
async def create_room(room: Room):
    rooms.append(room)
    response = {"id": len(rooms), **(room.dict())}
    log.info(f"create room: {room}")
    return JSONResponse(content=response, status_code=201)


@app.get("/rooms", response_model=List[Room])
async def get_rooms():
    res = [room.dict() for room in rooms]
    return JSONResponse(content=res, status_code=201)


@app.post("/rooms/{room_id}/join", response_model=Room)
async def join_room(room_id: int, user: User):
    rooms[room_id-1].members.append(user)
    res = rooms[room_id-1].dict()
    log.info(f"join room: {rooms[room_id-1]} <- {user}")
    return JSONResponse(content=res, status_code=201)


@app.get("/rooms/{room_id}", response_model=Room)
async def get_room(room_id: int):
    res = rooms[room_id - 1].dict()
    return JSONResponse(content=res, status_code=201)


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()

    key = ws.headers.get('sec-websocket-key')
    clients[key] = ws

    log.info([str(client) for client in clients])

    try:
        while True:
            data = await ws.receive_text()
            log.info(data)

            for client in clients.values():
                await client.send_text(data)
    except:
        del clients[key]
        await ws.close()
