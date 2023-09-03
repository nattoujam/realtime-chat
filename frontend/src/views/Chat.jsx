import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useSender, useReceiver } from "../hooks/websocket-hooks";
import useInterval from "../hooks/useInterval";

const Cursor = ({ userName }) => {
  const [position, setPosition] = useState({ x: null, y: null });

  useReceiver("mouse", (data) => {
    if (data.user === userName) {
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

const Comment = ({ userName }) => {
  const [text, setText] = useState("");
  const [message, setMessage] = useState([]);
  const commentSender = useSender("comment");

  useReceiver("comment", (data) => {
    setMessage((message) => [...message, data.message]);
  });

  const handleClick = () => {
    if (text.length === 0) return;
    commentSender({ message: `${userName}: ${text}` });
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

Comment.propTypes = {
  userName: PropTypes.string,
};

const ImageCard = ({ url, onSelect }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [select, setSelect] = useState(false);

  const selectImageSend = useSender("select-image");

  useReceiver("select-image", (data) => {
    if (data.url === url) {
      setSelect(true);
    }
  });

  useReceiver("drag-image", (data) => {
    if (data.url === url) {
      setPosition({ x: data.x, y: data.y });
    }
  });

  useReceiver("unselect-image", (data) => {
    if (data.url === url) {
      setSelect(false);
    }
  });

  const style = {
    position: "fixed",
    top: position.y,
    left: position.x,
    border: select ? "1rem solid" : "unset",
  };

  return (
    <>
      <img
        style={style}
        src={url}
        width="100px"
        height="100px"
        onMouseDown={(e) => {
          e.preventDefault();
          selectImageSend({ url: url });
          onSelect(url);
        }}
      />
    </>
  );
};

ImageCard.propTypes = {
  url: PropTypes.string,
  select: PropTypes.bool,
  onSelect: PropTypes.func,
};

const ImageGenerator = ({ onGenerate }) => {
  const apiEndpoint = "https://api.thecatapi.com/v1/images/search";

  const handleClick = () => {
    fetch(apiEndpoint)
      .then((response) => response.json())
      .then((json) => onGenerate(json[0].url));
  };

  return (
    <>
      <button onClick={handleClick}>generate</button>
    </>
  );
};

ImageGenerator.propTypes = {
  onGenerate: PropTypes.func,
};

const MouseCursorContainer = ({ userName, members }) => {
  console.log("create mouse container");
  return members
    .filter((member) => member.name !== userName)
    .map((member, i) => {
      return <Cursor key={i} userName={member.name} />;
    });
};

MouseCursorContainer.propTypes = {
  userName: PropTypes.string,
  members: PropTypes.array,
};

const ImageContainer = ({ onSelect }) => {
  const [images, setImages] = useState([]);
  console.log("create image container", images);

  useReceiver("create-image", (data) => {
    setImages((images) => [...images, data.url]);
  });

  return images.map((imageUrl, i) => {
    return (
      <ImageCard key={i} url={imageUrl} onSelect={(url) => onSelect(url)} />
    );
  });
};

ImageContainer.propTypes = {
  images: PropTypes.array,
  onSelect: PropTypes.func,
};

const Chat = () => {
  const { room_id } = useParams();
  const user = useRef(null);
  const [room, setRoom] = useState(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const [selectImageUrl, setSelectImageUrl] = useState(null);

  const mouseSender = useSender("mouse");
  const createImageSend = useSender("create-image");
  const selectImageSend = useSender("drag-image");
  const unselectImageSend = useSender("unselect-image");

  const dragAreaStyle = {
    backgroundColor: "gray",
    minHeight: "100vh",
    overflow: "hidden",
  };

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
      mouseSender({ user: user.current.name, ...mousePosition.current });
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

    if (selectImageUrl !== null) {
      selectImageSend({ x: e.clientX, y: e.clientY, url: selectImageUrl });
    }
  };

  const handleMouseUp = () => {
    if (selectImageUrl !== null) {
      unselectImageSend({ url: selectImageUrl });
      setSelectImageUrl(null);
    }
  };

  return (
    <>
      <div
        style={dragAreaStyle}
        onPointerMove={(e) => handleMouseMove(e)}
        onPointerUp={handleMouseUp}
      >
        <p>{user.current.name}</p>
        <p>{JSON.stringify(room)}</p>
        <Comment userName={user.current.name} />
        <ImageGenerator onGenerate={(url) => createImageSend({ url: url })} />
        <ImageContainer onSelect={(url) => setSelectImageUrl(url)} />
      </div>
      <MouseCursorContainer
        userName={user.current.name}
        members={room.members}
      />
    </>
  );
};

export default Chat;
