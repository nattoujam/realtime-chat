import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const navigate = useNavigate();
  const user = useRef(null);
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState(null);

  useEffect(() => {
    user.current = JSON.parse(localStorage.getItem("user"));
    fetchRoom();
  }, []);

  const fetchRoom = () => {
    fetch("http://localhost:8000/rooms")
      .then((res) => res.json())
      .then((json) => setRooms(json));
  };

  const joinRoom = (room_id) => {
    fetch(`http://localhost:8000/rooms/${room_id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user.current),
    });
    navigate(`/rooms/${room_id}`);
  };

  const createRoom = () => {
    fetch(`http://localhost:8000/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: user.current,
        members: [user.current],
        name: roomName,
      }),
    }).then(() => fetchRoom());
  };

  const Rooms = () => {
    if (rooms) {
      return (
        <>
          <ul>
            {rooms.map((room, i) => (
              <li key={i}>
                <button onClick={() => joinRoom(i + 1)}>{room.name}</button>
              </li>
            ))}
          </ul>
        </>
      );
    } else {
      <></>;
    }
  };

  if (!user.current) {
    return <p>undefined user</p>;
  }

  return (
    <>
      <p>Welcome to {user.current.name} !</p>
      <input value={roomName} onChange={(e) => setRoomName(e.target.value)} />
      <button onClick={createRoom}>create room</button>
      <Rooms />
    </>
  );
};

export default Lobby;
