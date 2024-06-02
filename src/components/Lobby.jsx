import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const Lobby = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const [name, setName] = useState(location?.state?.name || "");
	const [player, setPlayer] = useState(location?.state?.name || "");
	const [waiting, setWaiting] = useState(true);
	const [message, setMessage] = useState(
		"Share the lobby url to invite the game"
	);
	const [selectedOption, setSelectedOption] = useState();

	const params = useParams();
	const lobbyId = params.lobbyId;
	const [latestLobbies, setLatestLobbies] = useState(
		JSON.parse(window.localStorage.getItem("lobbies")) || []
	);

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
		const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
		const currentPlayer = currentLobby?.players?.find((x) => x.name === player);
		if (currentPlayer) currentPlayer.selectedOption = selectedOption;
		else console.log("name not in lobby");
		console.log(currentPlayer, latestLobbies);
		window.localStorage.setItem("lobbies", JSON.stringify(latestLobbies));
	};

	const showButtons = () => {
		const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
		const currentPlayer = currentLobby?.players?.find((x) => x.name === player);
		return waiting &&  !currentPlayer?.playing ? (
			<p>{message}</p>
		) : (
			<>
				<p>Waiting for opponent</p>
				<p>your selection is : {selectedOption}</p>
				<button onClick={() => setSelectedOption("Rock")}>Rock</button>
				<button onClick={() => setSelectedOption("Paper")}>Paper</button>
				<button onClick={() => setSelectedOption("Scissor")}>Scissor</button>
				<button onClick={handleSelection}>Done</button>
			</>
		);
	};

	const showResult = () => {
		const currentLobby = latestLobbies?.find((x) => x.lobbyName === lobbyId);
		const p1 = currentLobby?.players.pop();
		const p2 = currentLobby?.players.pop();
		const currentPlayer = currentLobby?.players?.find((x) => x.name === player);
	};

	return (
		<div>
			<p>Lobby</p>

			{player ? (
				<p>Your name is: {name}</p>
			) : (
				<>
					<input onChange={(e) => setName(e.target.value)} />
					<button onClick={joinLobby} disabled={!name.trim().length}>
						Join Lobby
					</button>
				</>
			)}
			{showButtons()}
		</div>
	);
};

export default Lobby;
