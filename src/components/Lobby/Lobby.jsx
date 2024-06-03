import React, { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import "./styles.css";
const Lobby = () => {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [player, setPlayer] = useState(searchParams.get("name") || "");
  const [waiting, setWaiting] = useState(true);
  const [message, setMessage] = useState(
    "Share the lobby url to invite the game"
  );
  const [selectedOption, setSelectedOption] = useState();
  const [disableDone, setDisableDone] = useState(false);
  const lobbyId = params.lobbyId;
  const [latestLobbies, setLatestLobbies] = useState(
    JSON.parse(window.localStorage.getItem("lobbies")) || []
  );
  const [gameStatus,setGameStatus] = useState("")
  const [playerScore, setPlayerScore] = useState()
  const [opponentScore, setOpponentScore] = useState()
  console.log("latestLobbies", latestLobbies);
  // get latest lobbies everytime the storage changes
  useEffect(() => {
    window.addEventListener("storage", () => {
      // When local storage changes, dump the list to
      // the console.
      setLatestLobbies(JSON.parse(window.localStorage.getItem("lobbies")));
    });
  });

  useEffect(() => {
    // const isPlayerPresent
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    if (currentLobby?.players && currentLobby?.players?.length > 1) {
      // lobby has more than 1 players
      setWaiting(false);
    } else if (currentLobby?.players && currentLobby?.players?.length === 1) {
      setMessage("enter name to join your friend");
    } else {
      setWaiting(true);
    }
  }, [latestLobbies, lobbyId]);

  const joinLobby = () => {
    setPlayer(() => name);
    const tempLobbies = JSON.parse(localStorage.getItem("lobbies")) || [];

    const currentLobby = tempLobbies.find((x) => x.lobbyName === lobbyId);
    if (currentLobby) {
      if (currentLobby?.players?.find((y) => y.name === name)) {
        alert("already name in lobby");
      } else {
        // if lobby present
        if (currentLobby?.players && currentLobby?.players?.length > 1) {
          //lobby has 1 player
          currentLobby?.players?.push({
            name: name.toLowerCase(),
            selectedOption: "",
            playing: false,
            score: 0,
          });

          // lobby has more than 1 players

          setWaiting(false);
        } else if (
          currentLobby?.players &&
          currentLobby?.players?.length === 1
        ) {
          currentLobby?.players?.push({
            name: name.toLowerCase(),
            selectedOption: "",
            playing: true,
            score: 0,
          });
          setWaiting(false);
          setMessage("enter name to join your friend");
        } else {
          setWaiting(true);
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

    console.log("nayi lobby banai ", tempLobbies);
    setLatestLobbies(tempLobbies);
    localStorage.setItem("lobbies", JSON.stringify(tempLobbies));
    // localStorage.setItem("lobbies", JSON.stringify(lobbies));
    setWaiting(false);
  };

  // set the option in localstorage
  const handleSelection = () => {
    setDisableDone(!disableDone);
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    const currentPlayer = currentLobby?.players?.find((x) => x.name === player);
    if (currentPlayer) currentPlayer.selectedOption = selectedOption;
    else console.log("name not in lobby");
    window.localStorage.setItem("lobbies", JSON.stringify(latestLobbies));
    showResult();
  };

  const showButtons = () => {
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    const currentPlayer = currentLobby?.players?.find((x) => x.name === player);
    return waiting && !currentPlayer?.playing ? (
      <p>{message}</p>
    ) : !currentPlayer?.playing ? (
      <>
        <span>You are in waiting lobby</span>
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
        <div>Click on done for confirming selection</div>
        <button onClick={handleSelection} disabled={disableDone}>
          Done
        </button>
      </>
    );
  };

  const showResult = () => {
    //get current lobby data
    const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
    //get active tab player
    const currentPlayer = currentLobby?.players?.find((x) => x.name === player);
    //get active tab opponent
    const oponent = currentLobby?.players?.find(
      (x) => x.selectedOption !== "" && x.playing === true && x.name !== player
    );

    console.log(oponent, "oponenet");
    console.log(currentPlayer, "current");
    
    const currentPlayerSelection = currentPlayer?.selectedOption;
    const oponentSelection = oponent?.selectedOption;
    if (currentPlayer.selectedOption !== "" && oponentSelection !== "" && oponentSelection !== undefined) {
      if (
        (currentPlayerSelection === "Rock" && oponentSelection === "Scissor") ||
        (currentPlayerSelection === "Paper" && oponentSelection === "Rock") ||
        (currentPlayerSelection === "Scissor" && oponentSelection === "Paper")
      ) {
        console.log("You win!");
        currentPlayer.score += 1;
        oponent.score -= 1
        setGameStatus(currentPlayer.name  + "Won")
        updateLatestLobbies();
      } else if (
        (oponentSelection === "Rock" && currentPlayerSelection === "Scissor") ||
        (oponentSelection === "Paper" && currentPlayerSelection === "Rock") ||
        (oponentSelection === "Scissor" && currentPlayerSelection === "Paper")
      ) {
        currentPlayer.score -= 1;
        oponent.score += 1;
        setGameStatus(currentPlayer.name  + "Lose")
        updateLatestLobbies();       
      } else {
        updateLatestLobbies();
        setGameStatus( "It's a Tie")
        setPlayerScore(currentPlayer.score)
        setOpponentScore(oponent.score)
      }
    }
  };

  function updateLatestLobbies(currentLobby, latestLobbies) {
    latestLobbies?.forEach((lobby) => {
      lobby?.players?.forEach((player) => {
        if (player.name === currentLobby.name) {
          player.selectedOption = currentLobby.selectedOption;
          player.playing = currentLobby.playing;
          player.score = currentLobby.score;
        }
      });
    });
  }

  useEffect(() => {
    localStorage.setItem("lobbies", JSON.stringify(latestLobbies));
  }, [latestLobbies]);
  return (
    <div className="lobby-container">
      {player ? (
        <>
          <p>Hi {name.toLocaleUpperCase()} !! </p>
          {showButtons()}
          {gameStatus && <span>{gameStatus}</span>}
          {playerScore && <span> Your score {playerScore}</span>}
          {opponentScore && <span> Opponent Score score {opponentScore}</span>}
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
