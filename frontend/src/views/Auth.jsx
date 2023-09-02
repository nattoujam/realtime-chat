import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const login = () => {
    console.log("login", name);

    fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name }),
    })
      .then((response) => response.json())
      .then((json) => {
        localStorage.setItem("user", JSON.stringify(json));
        navigate("/lobby");
      });
  };

  return (
    <>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />
      <button onClick={login}>Login</button>
    </>
  );
};

export default Auth;
