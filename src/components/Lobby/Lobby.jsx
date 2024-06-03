import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import "./styles.css";

const Lobby = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [player, setPlayer] = useState(searchParams.get("name") || "");
  const [waiting, setWaiting] = useState(true);
  const [message, setMessage] = useState(
    "Share the lobby url to invite the game"
  );
  const [selectedOption, setSelectedOption] = useState("");
  const [disableDone, setDisableDone] = useState(false);
  const lobbyId = params.lobbyId;
  const [latestLobbies, setLatestLobbies] = useState(
    JSON.parse(window.localStorage.getItem("lobbies")) || []
  );
  const [gameStatus, setGameStatus] = useState([]);
  const [playerScore, setPlayerScore] = useState(0); // Set initial score to 0
  //not used but can be used to scale
  const [opponentScore, setOpponentScore] = useState(0); // Set initial score to 0

  const opponent = latestLobbies
    ?.find((lobby) => lobby.lobbyName === lobbyId)
    ?.players?.find((x) => x.playing === true && x.name !== player);

  useEffect(() => {
    const handleStorageChange = () => {
      setLatestLobbies(JSON.parse(window.localStorage.getItem("lobbies")));
      const gameResult = JSON.parse(localStorage.getItem("gameStatus"));
      if (gameResult) {
        // Update the game status and scores in your component's state
        setGameStatus([gameResult]);
        setPlayerScore(gameResult.playerScore);
        setOpponentScore(gameResult.opponentScore);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    if (currentLobby?.players && currentLobby?.players?.length > 1) {
      setWaiting(false);
    } else if (currentLobby?.players && currentLobby?.players?.length === 1) {
      setMessage("Enter name to join your friend");
    } else {
      setWaiting(true);
    }
  }, [latestLobbies, lobbyId]);

  const joinLobby = () => {
    setPlayer(() => name);

    // Update query parameter with the player's name
    const urlSearchParams = new URLSearchParams(window.location.search);
    urlSearchParams.set("name", name);
    const newUrl = window.location.pathname + "?" + urlSearchParams.toString();
    window.history.replaceState({}, "", newUrl);
    const tempLobbies = JSON.parse(localStorage.getItem("lobbies")) || [];
    const currentLobby = tempLobbies.find((x) => x.lobbyName === lobbyId);

    if (currentLobby) {
      if (currentLobby?.players?.find((y) => y.name === name)) {
        alert("Name already in lobby");
      } else {
        if (currentLobby?.players?.length === 1) {
          currentLobby?.players?.push({
            name: name.toLowerCase(),
            selectedOption: "",
            playing: true,
            score: 0,
          });
          setWaiting(false);
        } else {
          currentLobby?.players?.push({
            name: name.toLowerCase(),
            selectedOption: "",
            playing: false,
            score: 0,
          });
          setWaiting(false);
        }
      }
    } else {
      tempLobbies.push({
        lobbyName: lobbyId,
        players: [
          {
            name: name.toLowerCase(),
            selectedOption: "",
            playing: true,
            score: 0,
          },
        ],
      });
    }

    setLatestLobbies(tempLobbies);
    localStorage.setItem("lobbies", JSON.stringify(tempLobbies));
    setWaiting(false);
  };

  const handleSelection = () => {
    setDisableDone(true);
    const updatedLobbies = latestLobbies.map((lobby) => {
      if (lobby.lobbyName === lobbyId) {
        return {
          ...lobby,
          players: lobby.players.map((p) =>
            p.name === player ? { ...p, selectedOption } : p
          ),
        };
      }
      return lobby;
    });

    setLatestLobbies(updatedLobbies);
    localStorage.setItem("lobbies", JSON.stringify(updatedLobbies));
  };

  const showButtons = () => {
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    const currentPlayer = currentLobby?.players?.find((x) => x.name === player);
    return waiting && !currentPlayer?.playing ? (
      <p>{message}</p>
    ) : !currentPlayer?.playing ? (
      <>
        <span>You are in the waiting lobby</span>
      </>
    ) : (
      <>
        <p>Waiting for opponent</p>
        <p>Your selection is : {selectedOption}</p>
        <div>
          <button
            className="rock-button animated-button"
            onClick={() => setSelectedOption("Rock")}
          >
            Rock
          </button>
          <button
            className="paper-button animated-button"
            onClick={() => setSelectedOption("Paper")}
          >
            Paper
          </button>
          <button
            className="scissors-button animated-button"
            onClick={() => setSelectedOption("Scissor")}
          >
            Scissor
          </button>
        </div>
        <div>Click on done to confirm selection</div>
        <button onClick={handleSelection} disabled={disableDone}>
          Done
        </button>
      </>
    );
  };

  const showResult = () => {
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    const currentPlayer = currentLobby?.players?.find((x) => x.name === player);
    const opponent = currentLobby?.players?.find(
      (x) => x.selectedOption !== "" && x.playing === true && x.name !== player
    );

    const currentPlayerSelection = currentPlayer?.selectedOption;
    const opponentSelection = opponent?.selectedOption;

    if (
      currentPlayerSelection &&
      opponentSelection &&
      currentPlayerSelection !== "" &&
      opponentSelection !== ""
    ) {
      let gameStatusMessage;
      if (
        (currentPlayerSelection === "Rock" &&
          opponentSelection === "Scissor") ||
        (currentPlayerSelection === "Paper" && opponentSelection === "Rock") ||
        (currentPlayerSelection === "Scissor" && opponentSelection === "Paper")
      ) {
        currentPlayer.score += 1;
        gameStatusMessage = `${currentPlayer.name} Won`;
      } else if (
        (opponentSelection === "Rock" &&
          currentPlayerSelection === "Scissor") ||
        (opponentSelection === "Paper" && currentPlayerSelection === "Rock") ||
        (opponentSelection === "Scissor" && currentPlayerSelection === "Paper")
      ) {
        opponent.score += 1;
        gameStatusMessage = `${currentPlayer.name} Lost`;
      } else {
        gameStatusMessage = "It's a Tie";
      }

      // Update local storage
      const gameResult = {
        currentPlayer: currentPlayer.name,
        opponent: opponent.name,
        gameStatus: gameStatusMessage,
        playerScore: currentPlayer.score,
        opponentScore: opponent.score,
      };
      setGameStatus([gameResult]);
      localStorage.setItem("gameStatus", JSON.stringify(gameResult));

      const updatedLobbies = latestLobbies.map((lobby) =>
        lobby.lobbyName === lobbyId ? currentLobby : lobby
      );
      setLatestLobbies(updatedLobbies);
      localStorage.setItem("lobbies", JSON.stringify(updatedLobbies));
    }
  };

  useEffect(() => {
    if (selectedOption && opponent?.selectedOption) {
      showResult();
    }
  }, [selectedOption, opponent?.selectedOption]);

  useEffect(() => {
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    const currentPlayer = currentLobby?.players?.find((x) => x.name === player);
    const oponent = currentLobby?.players?.find(
      (x) => x.selectedOption !== "" && x.playing === true && x.name !== player
    );
    // set score when oponent has played for cuurent player. (listening storage events)

    currentPlayer?.score && setPlayerScore(currentPlayer.score);
    oponent?.score && setOpponentScore(oponent.score);
  }, [latestLobbies]);
  console.log(opponent, "op");
  console.log(player, playerScore, "pleayer");
  console.log(gameStatus, "status");

  return (
    <div className="lobby-container">
      {player ? (
        <>
          <p>Hi {name.toUpperCase()} !! </p>
          {showButtons()}
          {!!gameStatus?.[0] && !!opponent && !!player && (
            <>
              <span>{gameStatus?.[0]?.gameStatus}</span>
              {playerScore !== undefined && (
                <span>
                  {" "}
                  Your score{" "}
                  {gameStatus?.[0]?.currentPlayer === player
                    ? gameStatus?.[0]?.playerScore
                    : gameStatus?.[0]?.opponentScore}
                </span>
              )}
              {opponent?.score !== undefined && (
                <span>
                  {" "}
                  {opponent?.name} score{" "}
                  {gameStatus?.[0]?.opponent === opponent?.name
                    ? gameStatus?.[0]?.opponentScore
                    : gameStatus?.[0]?.playerScore}
                </span>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <h1>Enter your name to join lobby {lobbyId}</h1>
          <input onChange={(e) => setName(e.target.value)} />
          <button onClick={joinLobby} disabled={!name.trim().length}>
            Join Lobby
          </button>
        </>
      )}
    </div>
  );
};

export default Lobby;
