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

export const useConnect = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    setSocket(WSClient.getInstance());
  }, []);

  return socket;
};

export const useReceiver = (eventName, callback) => {
  const socket = useConnect();

  useEffect(() => {
    console.log("add", eventName, callback);
    socket?.addEventListener(eventName, callback);
    return () => {
      console.log("delete", eventName, callback);
      socket?.removeEventListener(eventName, callback);
    };
  }, [socket]);
};
