import { useEffect, useState } from "react";
import * as Websocket from "websocket";

class WSClient {
  static getInstance() {
    if (this.instance === undefined) {
      this.instance = new Websocket.w3cwebsocket("ws://localhost:8000/ws");
    }
    return this.instance;
  }
}

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(WSClient.getInstance());
  }, []);

  return socket;
};

export const useSender = (eventName) => {
  const socket = useSocket();
  const send = (data) => {
    socket?.send(JSON.stringify({ type: eventName, ...data }));
  };

  return send;
};

export const useReceiver = (eventName, callback) => {
  const socket = useSocket();

  const onMessage = (e) => {
    const data = JSON.parse(e.data);
    console.log("onmessage", data);
    if (data.type === eventName) {
      callback(data);
    }
  };

  useEffect(() => {
    console.log("add", eventName);
    socket?.addEventListener("message", onMessage);
    return () => {
      console.log("delete", eventName);
      socket?.removeEventListener("message", onMessage);
    };
  }, [socket]);
};
