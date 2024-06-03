import { Route, Routes } from "react-router-dom";
import "./App.css";
import Lobby from "./components/Lobby/Lobby";
import { CreateLobby } from "./components/Home/HomePage";

function App() {
  return (
    <div
      style={{
        backgroundColor: "black",
        backgroundSize: "cover",
        width: "100vw",
        height: "100vh",
        padding: "20px",
      }}
    >
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/:lobbyId" element={<Lobby />} />
        <Route path="*" element={<CreateLobby />} />
      </Routes>
    </div>
  );
}

export default App;
