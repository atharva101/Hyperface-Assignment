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
  const [gameStatus, setGameStatus] = useState(
    JSON.parse(localStorage.getItem("gameStatus")) || {}
  );
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [showStart, setShowStart] = useState(false);
  const opponent = latestLobbies
    ?.find((lobby) => lobby.lobbyName === lobbyId)
    ?.players?.find((x) => x?.playing === true && x?.name !== player);

  useEffect(() => {
    const handleStorageChange = () => {
      const lobbies = JSON.parse(window.localStorage.getItem("lobbies"));
      setLatestLobbies(lobbies);
      const gameResult = JSON.parse(localStorage.getItem("gameStatus"));
      if (gameResult) {
        setGameStatus(gameResult);
        setPlayerScore(gameResult.playerScore);
        setOpponentScore(gameResult.opponentScore);
      }
      const currentLobby = lobbies?.find((x) => x.lobbyName === lobbyId);
      const currentPlayer = currentLobby?.players?.find(
        (x) => x?.name === player
      );
      if (currentPlayer) {
        setSelectedOption(currentPlayer.selectedOption);
        setDisableDone(currentPlayer.selectedOption !== "");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [lobbyId, player]);

  
  useEffect(() => {
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    if (currentLobby?.players && currentLobby?.players?.length > 1) {
      setWaiting(false);
    } else if (currentLobby?.players && currentLobby?.players?.length === 1) {
      setMessage("Enter name to join your friend");
    } else {
      setWaiting(true);
    }
  }, [latestLobbies]);

  const joinLobby = () => {
    setPlayer(name);

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
        } else if (
          currentLobby.players?.filter((player) => player.playing === true)
            .length < 2
        ) {
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
    setGameStatus([])
    localStorage.removeItem("gameStatus")
    setLatestLobbies(updatedLobbies);
    localStorage.setItem("lobbies", JSON.stringify(updatedLobbies));
  };

  const playWithAnotherPlayer = () => {
    const updatedLobbies = latestLobbies.map((lobby) => {
      if (lobby.lobbyName === lobbyId) {
        // Find the player who is in the waiting lobby
        const waitingPlayer = lobby.players.find(
          (p) => !p.playing && p.name !== player
        );
        if (waitingPlayer) {
          setShowStart(true); // Show the start button
        }
        return {
          ...lobby,
          players: lobby.players.map((p) => {
            if (p.name === player) {
              // Set current player to not playing
              return { ...p, playing: false };
            }
            if (waitingPlayer && p.name === waitingPlayer.name) {
              // Set waiting player to playing
              return { ...p, playing: false }; // Change this to false
            }
            return p;
          }),
        };
      }
      return lobby;
    });
    setLatestLobbies(updatedLobbies);
    localStorage.removeItem("gameStatus")
    setSelectedOption("")
    setGameStatus([])
    localStorage.setItem("lobbies", JSON.stringify(updatedLobbies));
  };
  
  const start = () => {
    const currentLobby = latestLobbies.find((x) => x.lobbyName === lobbyId);

   if(currentLobby?.players?.filter(player => player?.playing === true)?.length < 2){
    const updatedLobbies = latestLobbies.map((lobby) => {
      if (lobby.lobbyName === lobbyId) {
        return {
          ...lobby,
          players: lobby.players.map((p) => {
            if(p.playing === true){
              p.selectedOption = ""
            }
            if (p.name === player) {
              // Set current player to playing
              return { ...p, playing: true };
            }
           
            return p;
          }),
        };
      }
      return lobby;
    });
    setGameStatus([])
    setSelectedOption("")
    localStorage.removeItem(gameStatus)
    setLatestLobbies(updatedLobbies);
    localStorage.setItem("lobbies", JSON.stringify(updatedLobbies));
    setShowStart(false); // Hide the start button
  }else{
    alert("Someone joined the game")
  }
  };
  
  const showButtons = () => {
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    const currentPlayer = currentLobby?.players?.find((x) => x?.name === player);
    return waiting && !currentPlayer?.playing ? (
      <p>{message}</p>
    ) : !currentPlayer?.playing ? (
      <>
        <span>You are in the waiting lobby</span>
        {showStart && <button onClick={start}>Start Game</button>}
      </>
    ) : (
      <>
        <p>Waiting for opponent</p>
        <p>Your selection is: {selectedOption}</p>
        <div className="rps-button-container">
          <button
            className="rock-button animated-button"
            onClick={() => setSelectedOption("Rock")}
            disabled={disableDone}
          >
            Rock
          </button>
          <button
            className="paper-button animated-button"
            onClick={() => setSelectedOption("Paper")}
            disabled={disableDone}
          >
            Paper
          </button>
          <button
            className="scissors-button animated-button"
            onClick={() => setSelectedOption("Scissor")}
            disabled={disableDone}
          >
            Scissor
          </button>
        </div>
        <div>Click on done to confirm selection</div>
        <button onClick={handleSelection} disabled={disableDone}>
          Done
        </button>
        {gameStatus?.gameStatus && !!opponent && !!player && (
          <>
            <span>{gameStatus.gameStatus}</span>
            <span> Your score: {gameStatus?.currentPlayer === player ? gameStatus.playerScore: gameStatus.opponentScore}</span>
            <span>
              {" "}
              {opponent.name} score: {gameStatus?.opponent === player ? gameStatus.opponentScore : gameStatus.playerScore}
            </span>
            <button className="rematch-button" onClick={handleRequestRematch}>
              Request Rematch
            </button>
          </>
        )}
        <div>
          <button style = {{marginTop: "20px"}} onClick={playWithAnotherPlayer}>Exit Match</button>
        </div>
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

      const gameResult = {
        currentPlayer: currentPlayer.name,
        opponent: opponent.name,
        gameStatus: gameStatusMessage,
        playerScore: currentPlayer.score,
        opponentScore: opponent.score,
      };
      setGameStatus(gameResult);
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
    const currentPlayer = currentLobby?.players?.find((x) => x?.name === player);
    const opponent = currentLobby?.players?.find(
      (x) => x?.selectedOption !== "" && x?.playing === true && x?.name !== player
    );
    currentPlayer?.score && setPlayerScore(currentPlayer.score);
    opponent?.score && setOpponentScore(opponent.score);
  }, [latestLobbies]);

  const handleRequestRematch = () => {
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    const currentPlayer = currentLobby?.players?.find((x) => x.name === player);
    const opponent = currentLobby?.players?.find(
      (x) => x.selectedOption !== "" && x.playing === true && x.name !== player
    );

    currentPlayer.requestedRematch = true;

    const updatedLobbies = latestLobbies.map((lobby) =>
      lobby.lobbyName === lobbyId ? currentLobby : lobby
    );

    localStorage.setItem("lobbies", JSON.stringify(updatedLobbies));
    // Uncomment the line below if using state management for latestLobbies
    // setLatestLobbies(updatedLobbies);

    if (opponent?.requestedRematch === true) {
      alert("Starting new game");
      startNewGame(currentLobby, currentPlayer, opponent);
      setDisableDone(false);
    } else {
      alert("Waiting for opponent to accept request");
    }
  };

  const startNewGame = (currentLobby, currentPlayer, opponent) => {
    setSelectedOption("");
    setGameStatus({});
    currentPlayer.requestedRematch = false;
    opponent.requestedRematch = false;
    opponent.selectedOption = "";
    currentPlayer.selectedOption = "";
    currentPlayer.playing = true;
    const updatedLobbies = latestLobbies.map((lobby) =>
      lobby.lobbyName === lobbyId ? currentLobby : lobby
    );

    localStorage.setItem("lobbies", JSON.stringify(updatedLobbies));
    localStorage.setItem("gameStatus", JSON.stringify({}));
    // Uncomment the line below if using state management for latestLobbies
    // setLatestLobbies(updatedLobbies);
  };

  useEffect(() => {
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    const currentPlayer = currentLobby?.players?.find((x) => x?.name === player);
    const opponent = currentLobby?.players?.find(
      (x) => x?.selectedOption !== "" && x?.playing === true && x?.name !== player
    );
    if(currentPlayer?.playing === true){
    if (currentPlayer?.requestedRematch || opponent?.requestedRematch) {
      if (currentPlayer.requestedRematch && !opponent?.requestedRematch) {
        alert("Waiting for opponent to accept request");
      }
      if (opponent?.requestedRematch && !currentPlayer.requestedRematch) {
        alert("Opponent has requested a rematch");
      }
      if (currentPlayer.requestedRematch && opponent?.requestedRematch) {
        alert("Starting new game");
        startNewGame(currentLobby, currentPlayer, opponent);
      }
    }}
  }, [latestLobbies, player, lobbyId]);

  useEffect(() => {
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    const currentPlayer = currentLobby?.players?.find((x) => x?.name === player);
    const playersPlaying = currentLobby?.players?.filter(
      (x) => x?.playing === true
    ).length;

    if (currentPlayer && !currentPlayer?.playing && playersPlaying < 2) {
      alert("Another player is available");
      setShowStart(true);
    }
  }, [latestLobbies, player, lobbyId]);

  return (
    <div className="lobby-container">
      {player ? (
        <>
          <p>Hi {name.toUpperCase()} !! </p>
          {showButtons()}
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
