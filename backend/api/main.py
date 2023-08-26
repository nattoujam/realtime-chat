from fastapi import FastAPI
from starlette.websockets import WebSocket, WebSocketDisconnect
from logging import getLogger
from rich.logging import RichHandler

app = FastAPI()

clients = dict()

log = getLogger('uvicorn')
# log.addHandler(RichHandler())


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
