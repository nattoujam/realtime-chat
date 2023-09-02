import { Routes, Route, BrowserRouter } from "react-router-dom";
import Auth from "./views/Auth";
import Chat from "./views/Chat";
import Lobby from "./views/Lobby";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/rooms/:room_id" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
