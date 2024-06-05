import React, { useEffect, useState } from "react";
import "./styles.css";
import Card from "../Card/card";

export const CreateLobby = () => {
  const [name, setName] = useState("");
  const [lobbyId, setLobbyId] = useState("");
  const [gameLobbyPlayers, setGameLobbyPlayers] = useState([]);
  const [waitingLobbyPlayers, setWaitingLobbyPlayers] = useState([]);
  const [leaderBoardData, setLeaderBoardData] = useState([]);

  useEffect(() => {
    const updateStateFromLocalStorage = () => {
      const lobbies = JSON.parse(localStorage.getItem("lobbies") || "[]");
      const allPlayers = lobbies?.flatMap((lobby) => lobby.players);

      const gameLobbyPlayers = lobbies
        ?.flatMap((lobbyData) =>
          lobbyData.players.map((player) => ({
            ...player,
            lobbyId: lobbyData.lobbyName,
          }))
        )
        .filter((player) => player.playing === true);

      const waitingLobbyPlayers = lobbies
        ?.flatMap((lobbyData) =>
          lobbyData.players.map((player) => ({
            ...player,
            lobbyId: lobbyData.lobbyName,
          }))
        )
        .filter((player) => player.playing !== true);

      // Sort players based on their score in descending order
      const sortedPlayers = allPlayers?.sort((a, b) => b?.score - a?.score);

      setGameLobbyPlayers(gameLobbyPlayers);
      setWaitingLobbyPlayers(waitingLobbyPlayers);
      setLeaderBoardData(sortedPlayers);
    };

    // Subscribe to changes in local storage
    window.addEventListener("storage", updateStateFromLocalStorage);

    // Fetch initial state from local storage
    updateStateFromLocalStorage();

    // Clean up event listener
    return () => {
      window.removeEventListener("storage", updateStateFromLocalStorage);
    };
  }, []);

  //create lobbyId
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

  // create lobby
  const createLobby = () => {
    const lobbyId = makeid(6);
    const lobbies = JSON.parse(localStorage.getItem("lobbies")) || [];
    lobbies.push({
      lobbyName: lobbyId,
      players: [
        {
          name: name?.toLowerCase(),
          selectedOption: "",
          playing: true,
          score: 0,
        },
      ],
    });
    localStorage.setItem("lobbies", JSON.stringify(lobbies));
    setLobbyId(lobbyId);
  };

  const copyUrlToClipboard = async () => {
    try {
      // Write the lobby ID to the clipboard
      await navigator.clipboard.writeText(
        window.location.origin + "/" + lobbyId
      );
      // Show a confirmation message with the URL

      alert(
        `URL copied to clipboard!\nYou can share the lobby URL: ${
          window.location.href + "/" + lobbyId
        }`
      );
    } catch (error) {
      console.error("Failed to copy lobby ID to clipboard:", error);

      alert("Failed to copy lobby ID to clipboard. Please try again.");
    }
  };

  const goToLobby = () => {
    const lobbyUrl = `${window.location.origin}/${lobbyId}/?goToLobby=true&name=${name}`;

    window.open(lobbyUrl, "_blank");
  };

  const handlePlayRedirection = (player) => {
    const lobbyUrl = `${window.location.origin}/${player.lobbyId}?name=${player?.name}`;
    window.open(lobbyUrl, +"_blank");
  };

  return (
    <>
      <div className="heading-container">
        <span className="heading"> Rock paper scissor game </span>
      </div>
      {!lobbyId ? (
        <div className="create-lobby-container">
          <h1> Enter your username to create a lobby </h1>
          <div className="lobby-input-container">
            <input
              height={40}
              type="text"
              onChange={(e) => setName(e.target.value)}
            />
            <button onClick={createLobby} disabled={!name.length}>
              Create Lobby
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button style={{ cursor: "pointer" }} onClick={goToLobby}>
            Go to game lobby
          </button>
          <br />
          <button
            style={{
              cursor: "pointer",
              textDecoration: "none",
              alignSelf: "center",
            }}
            onClick={copyUrlToClipboard}
          >
            Share this URL to invite
          </button>
        </div>
      )}

      <div className="data-view-container">
        {!!gameLobbyPlayers?.length && (
          <Card heading={"Game Lobby"}>
            <div>
              <ol>
                {gameLobbyPlayers.map((player) => (
                  <li>
                    <div className="card-item">
                      <span style={{ alignSelf: "center" }}>{player.name}</span>
                      <button onClick={() => handlePlayRedirection(player)}>
                        Play
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        )}
        {!!leaderBoardData?.length && (
          <Card heading={"Leaderboard"}>
            <div>
              <ol>
                {leaderBoardData.map((player) => (
                  <li>
                    <div className="card-item">
                      <span>{player?.name}</span>
                      <span>{player?.score}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        )}
        {!!waitingLobbyPlayers?.length && (
          <Card heading={"Waiting Lobby"}>
            <div>
              <ol>
                {waitingLobbyPlayers.map((player) => (
                  <li>
                    <div className="card-item">
                      <span>{player?.name}</span>
                      <button onClick={() => handlePlayRedirection(player)}>
                        Play
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};
