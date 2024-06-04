import { Route, Routes } from "react-router-dom";
import "./App.css";
import Lobby from "./components/Lobby/Lobby";
import { CreateLobby } from "./components/Home/HomePage";

function App() {
  return (
    <div
      style={{
      
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
