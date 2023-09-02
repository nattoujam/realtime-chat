import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useConnect, useReceiver } from "../hooks/useConnect.js";
import useInterval from "../hooks/useInterval.js";

const Cursor = ({ userName }) => {
  const [position, setPosition] = useState({ x: null, y: null });

  useReceiver("message", (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "mouse" && data.user === userName) {
      console.log("set cursor", data);
      setPosition({ x: data.x, y: data.y });
    }
  });

  if (position.x === null || position.y === null) {
    return <></>;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
      }}
    >
      <p>{userName}</p>
      <img src="../vite.svg" />
    </div>
  );
};

Cursor.propTypes = {
  userName: PropTypes.string,
};

const Comment = () => {
  const [text, setText] = useState("");
  const [message, setMessage] = useState([]);
  const socket = useConnect();

  useReceiver("message", (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "message") {
      console.log("message", message);
      setMessage((message) => [...message, data.message]);
      console.log("set message", message);
    }
  });

  const handleClick = () => {
    if (text.length === 0) return;
    const data = { type: "message", message: text };
    socket.send(JSON.stringify(data));
    setText("");
  };

  return (
    <>
      {message.map((m, i) => {
        return <div key={i}>{m}</div>;
      })}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="new message"
      />
      <button onClick={handleClick}>send</button>
    </>
  );
};

const Chat = () => {
  const { room_id } = useParams();
  const user = useRef(null);
  const [room, setRoom] = useState(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const socket = useConnect();

  const dragAreaStyle = { backgroundColor: "gray", minHeight: "100vh" };

  useEffect(() => {
    user.current = JSON.parse(localStorage.getItem("user"));
    fetch(`http://localhost:8000/rooms/${room_id}`)
      .then((response) => response.json())
      .then((json) => setRoom(json));
  }, [room_id]);

  useInterval(() => {
    if (
      previousMousePosition.current.x !== mousePosition.current.x ||
      previousMousePosition.current.y !== mousePosition.current.y
    ) {
      socket?.send(
        JSON.stringify({
          type: "mouse",
          user: user.current.name,
          ...mousePosition.current,
        })
      );
      previousMousePosition.current = mousePosition.current;
    }
  }, 50);

  if (!room) {
    return "connecting";
  }

  const handleMouseMove = (e) => {
    mousePosition.current = {
      x: e.clientX,
      y: e.clientY,
      timeStamp: e.timeStamp,
    };
  };

  const FriendMouseCursors = () => {
    return room.members
      .filter((member) => member.name !== user.current.name)
      .map((member, i) => {
        return <Cursor key={i} userName={member.name} />;
      });
  };

  return (
    <>
      <h1>{user.current.name}</h1>
      <p>{JSON.stringify(room)}</p>
      <div style={dragAreaStyle} onPointerMove={(e) => handleMouseMove(e)}>
        <Comment />
      </div>
      <FriendMouseCursors />
    </>
  );
};

export default Chat;
