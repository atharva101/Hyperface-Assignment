import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

export const CreateLobby = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [lobbyId, setLobbyId] = useState("");
  function makeid(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  const createLobby = () => {
    const lobbyId = makeid(6);
    const lobbies = JSON.parse(localStorage.getItem("lobbies")) || [];
    lobbies.push({
      lobbyName: lobbyId,
      players: [
        {
          name: name.toLowerCase(),
          selectedOption: "",
          playing: true,
        },
      ],
    });
    localStorage.setItem("lobbies", JSON.stringify(lobbies));
    setLobbyId(lobbyId);
  };

  const goToLobby = () => {
    window.open(`/${lobbyId}`, "_blank");
  };

  return (
    <>
      <div className="heading-container">
        <span className="heading"> Rock paper scissor game </span>
      </div>
      {!lobbyId ? (
        <div className="create-lobby-container">
          <h1> Enter your name and create a lobby </h1>
          <input type="text" onChange={(e) => setName(e.target.value)} />
          <button onClick={createLobby} disabled={!name.length}>
            Create Lobby
          </button>
        </div>
      ): (
		<div>
			Go To game lobbby {lobbyId}
		</div>
	  )}
      
    </>
  );
};
