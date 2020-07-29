const usernamePage = document.querySelector('#username-page');
const usernameForm = document.querySelector('#usernameForm');
const joinRoom = document.querySelector("#join-room-text");
const playersA = document.getElementById("players-a");
const playersB = document.getElementById("players-b");
const teamAMindies = document.getElementById("team-a-mindies");
const teamBMindies = document.getElementById("team-b-mindies");
const startGameButton = document.getElementById("start-game-btn");
const copyButton = document.getElementById("copy-button");
const URL = "http://localhost:5000";

let userId = null;
let userName = null;
let roomId = null;
let roomCreator = false;
let socket = null;
let stompClient = null;
let myCards = [];

let teamA = {
	hands: 0,
	players: [],
	mindies: []
};
let teamB = {
	hands: 0,
	players: [],
	mindies: []
};

const colors = ['#2196F3', '#32c787', '#00BCD4', '#ff5652', '#ffc107',
	'#ff85af', '#FF9800', '#39bbb0'];

usernameForm.addEventListener('submit', connect, true);
startGameButton.addEventListener('click', startGame, true);
copyButton.addEventListener("click", copyText, true);

function connect(event) {
	userId = uuidv4();
	userName = document.querySelector('#user-name').value;

	if(userName.trim()) {
		if(userName.length > 10) {
			alert("Username must be less than 11 characters")
		}
		else {
			const join = document.getElementById("join-room");
			if (join.checked) {
				roomId = document.getElementById("room-id").value;
				if (roomId.trim()) {
					get("/rooms/check", {roomId: roomId}, (response) => {
						if (response.status === "success") createSocket();
						else alert("Invalid room id.");
					});
				} else alert("Enter valid room id");
			} else {
				roomCreator = true;
				roomId = uuidv4();
				createSocket();
			}
		}
	}
	else {
		alert("Please enter valid username");
		document.querySelector('#user-name').value = '';
	}
	
	event.preventDefault();
}

function createSocket() {
	socket = new SockJS("/ng-knt");
	stompClient = Stomp.over(socket);
	stompClient.connect({}, () => {
		stompClient.subscribe("/topic/" + userId, onPersonalMessageReceived);
		stompClient.subscribe("/topic/" + roomId, onMessageReceived);
		const user = {
			userId: userId,
			userName: userName,
			roomId: roomId
		};
		if(roomCreator) {
			stompClient.send("/app/rooms/create", {}, JSON.stringify(user));
			const current = {
				first: userId,
				second: userName
			}
			teamA.players.push(current);
		}
		else stompClient.send("/app/rooms/join", {}, JSON.stringify(user));

		usernamePage.classList.add('hidden');
		document.getElementById("game-page").classList.remove('hidden');
		document.getElementById("room-id-info").value = `${roomId}`;

		if(roomCreator === true)
			document.getElementById('decks').disabled = false;

		updatePlayers();
	}, (error) => {
		alert(error.message);
	});
}

function onMessageReceived(data) {
	data = JSON.parse(data.body);
	if(data.type === "JOIN") {
		teamA.players = [];
		teamB.players = [];
		for(let i=0; i<data.players.length; i+=1) {
			if(i%2 === 0) teamA.players.push(data.players[i]);
			else teamB.players.push(data.players[i]);
		}
	}
	else if(data.type === "LEAVE") {
		const left_player = data.players[0];
		let players = teamA.players.filter(player => {
			return player.first !== left_player.first;
		});
		players.concat(teamB.players.filter(player => {
			return player.first !== left_player.first;
		}));

		teamA.players = [];
		teamB.players = [];
		for(let i=0; i<players.length; i+=1) {
			if(i%2 === 0) teamA.players.push(players[i]);
			else teamB.players.push(players[i]);
		}
	}
	updatePlayers();
}

function onPersonalMessageReceived(data) {
	data = JSON.parse(data.body)
	if(data.type === 'START_GAME') {
		teamA.hands = 0;
		teamA.mindies = [];

		teamB.hands = 0;
		teamB.mindies = [];

		myCards = data.cards;
		document.getElementById("decks").value = data.decks;
	}
}

function updatePlayers() {
	playersA.innerHTML = '';
	playersB.innerHTML = '';

	for (let i = 0; i < teamA.players.length; i++) {
		const new_row = document.createElement("LI");
		new_row.classList.add("list-group-item");
		new_row.innerHTML = `${teamA.players[i].second}`;
		if (teamA.players[i].first === userId) new_row.classList.add("its-me");
		playersA.appendChild(new_row);
	}

	for (let i = 0; i < teamB.players.length; i++) {
		const new_row = document.createElement("LI");
		new_row.classList.add("list-group-item");
		new_row.innerHTML = `${teamB.players[i].second}`;
		if (teamB.players[i].first === userId) new_row.classList.add("its-me");
		playersB.appendChild(new_row);
	}

	if(roomCreator && teamA.players.length === teamB.players.length)
		document.getElementById('start-game-btn').disabled = false;
	else
		document.getElementById('start-game-btn').disabled = true;
}

function startGame() {
	startGameButton.disabled = true;
	document.getElementById("room-id-info").select();

	const decks = document.getElementById("decks");
	decks.disabled = true;

	get('/game/start', {
		roomId: roomId,
		decks: decks.value
	}, (response) => {});
}

function addMindies() {
	for (let i = 0; i < teamA.mindies.length; i += 1) {
		const new_row = document.createElement("LI");
		const img = document.createElement("IMG");
		img.classList.add("score-img");
		img.src = `./images/10${teamAScore.mindies[i]}.png`;
		new_row.appendChild(img);
		teamAMindies.appendChild(new_row);
	}

	for (let i = 0; i < teamBScore.mindies.length; i += 1) {
		const new_row = document.createElement("LI");
		const img = document.createElement("IMG");
		img.classList.add("score-img");
		img.src = `./images/10${teamAScore.mindies[i]}.png`;
		new_row.appendChild(img);
		teamBMindies.appendChild(new_row);
	}
}

function getAvatarColor(messageSender) {
	var hash = 0;
	for (var i = 0; i < messageSender.length; i++) {
		hash = 31 * hash + messageSender.charCodeAt(i);
	}
	var index = Math.abs(hash % colors.length);
	return colors[index];
}

function enableJoinText() {
	joinRoom.classList.remove("hidden");
	document.getElementById("room-id").required = true;
}

function disableJoinText() {
	joinRoom.classList.add("hidden");
	document.getElementById("room-id").required = false;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
  });
}

function copyText() {
	const copyText = document.getElementById("room-id-info");
	copyText.disabled = false;
	copyText.focus();
	copyText.select();
	document.execCommand("copy");
	copyText.blur();
	copyText.disabled = true;
}

function get(url, data, success){
	$.ajax({
		type: "GET",
		contentType: "application/json",
		url: URL + url,
		data: data,
		dataType: "json",
		success: success,
		error: function (e) {
			if(e) console.log(e);
			else console.log("error");
		}
	});
}

function post(url, data, success) {
	$.ajax({
		type: "POST",
		contentType: "application/json",
		url: URL + url,
		data: JSON.stringify(data),
		dataType: "json",
		success: success,
		error: function (e) {
			if(e) console.log(e);
			else console.log("error");
		}
	});
}