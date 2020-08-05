const usernamePage = document.querySelector('#username-page');
const usernameForm = document.querySelector('#usernameForm');
const joinRoom = document.querySelector("#join-room-text");
const playersA = document.getElementById("players-a");
const playersB = document.getElementById("players-b");
const handsA = document.getElementById("hands-a");
const handsB = document.getElementById("hands-b");
const hakamA = document.getElementById("hakam-a");
const hakamB = document.getElementById("hakam-b");
const teamAMindies = document.getElementById("team-a-mindies");
const teamBMindies = document.getElementById("team-b-mindies");
const scores = document.getElementsByClassName("scores");
const decks = document.getElementById("decks");
const startGameButton = document.getElementById("start-game-btn");
const copyButton = document.getElementById("copy-button");
const playersArea = document.getElementById("players-area");
const myArea = document.getElementById("my-area");
const URL = "https://mindi-friends.herokuapp.com";

let userId = null;
let userName = null;
let indexId = null;
let roomId = null;
let roomCreator = false;

let socket = null;
let stompClient = null;

let gameStarted = false;
let turn = false;
let firstPlayer = null;
let hakam = null;
let currentSuit = null;
let suitCount = {"H":0, "S":0, "D":0, "C":0};
let hand = [];
let myCards = [];
let doneHands = 0;
let totalHands = 0;

let players = [];
let teamA = {
	hands: 0,
	mindies: []
};
let teamB = {
	hands: 0,
	mindies: []
};

const valueMap = {
	"TWO":2, "THREE":3, "FOUR":4, "FIVE":5, "SIX":6, "SEVEN":7, "EIGHT":8,
	"NINE":9, "TEN":10, "JACK":11, "QUEEN":12, "KING":13, "ACE":14,
	"HEARTS":0, "SPADES":1, "DIAMONDS":2, "CLUBS":3
}

const alterName = {
	"S": "SPADES", "H": "HEARTS", "C": "CLUBS", "D": "DIAMONDS",
	"SPADES": "S", "HEARTS": "H", "CLUBS": "C", "DIAMONDS": "D"
}

usernameForm.addEventListener('submit', connect, true);
startGameButton.addEventListener('click', startNewGame, true);
copyButton.addEventListener("click", copyText, true);
window.addEventListener("beforeunload", (event) => {
	event.returnValue = "If you refresh you will be out of game!";
	return "If you refresh you will be out of game!";
});

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
						else if (response.status === "started") alert("Game already started");
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
		stompClient.subscribe("/topic/" + userId, onMessageReceived);
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
			players.push(current);
		} else stompClient.send("/app/rooms/join", {}, JSON.stringify(user));

		usernamePage.classList.add("hidden");
		document.getElementById("game-page").classList.remove("hidden");
		document.getElementById("room-id-info").value = `${roomId}`;
		updatePlayers();
	}, (error) => alert(error.message));
}

function onMessageReceived(data) {
	data = JSON.parse(data.body);
	if (data.type === "JOIN") JOIN(data);
	else if (data.type === "LEAVE") LEAVE(data);
	else if (data.type === "START_GAME") START_GAME(data);
	else if (data.type === "CHANGE_TURN") CHANGE_TURN(data);
	else if (data.type === "CHANGE_HAND") CHANGE_HAND(data).then(r => {});
	else if (data.type === "END_GAME") END_GAME(data);
	else if (data.type === "RESET") RESET();
}
function JOIN(data) {
	if (gameStarted === true) return;
	players = [];
	for(let i=0; i<data.players.length; i++)
		players.push(data.players[i]);
	updatePlayers();
}
function LEAVE(data) {
	const left_player = data.players[0];
	players = players.filter(player => {
		return player.first !== left_player.first;
	});

	roomCreator = players[0].first === userId;
	if (gameStarted === true) RESET();
	updatePlayers();
}
function START_GAME(data) {
	RESET();
	gameStarted = true;
	for(const card of data.cards) {
		myCards.push(card);
		suitCount[card.suit[0]]++;
	}
	totalHands = myCards.length;

	for(const element of scores)
		element.classList.remove("hidden");

	handsA.innerHTML = `Hands = ${teamA.hands}`;
	handsB.innerHTML = `Hands = ${teamB.hands}`;

	firstPlayer = data.firstPlayer;
	decks.value = data.decks;
	startGame();
}
function CHANGE_TURN(data) {
	const previous = document.getElementById(players[data.previous].first);
	previous.firstChild.classList.remove("current-turn");
	previous.lastChild.src = `./images/${data.card.rank}${data.card.suit}.png`;
	previous.lastChild.alt = `${data.card.rank} of ${alterName[data.card.suit]}`;
	if (roomCreator === true)
		hand.push({suit: data.card.suit, rank: data.card.rank, id: data.previous});

	currentSuit = data.currentSuit;
	if (hakam === null && data.hakam !== null) {
		hakam = data.hakam;
		const suit = hakam === "H" ? "Hearts" : hakam === "S" ? "Spades" : hakam === "D" ? "Diamonds" : "Clubs";
		document.getElementById(`hakam-${(data.previous % 2 === 0) ? "a" : "b"}`).innerHTML = `Hakam = ${suit}`;
	}

	const next = (data.previous + 1) % players.length;
	if (next !== firstPlayer) {
		document.getElementById(players[next].first).firstChild.classList.add("current-turn");
		if (next === indexId) turn = true;
	} else if (roomCreator === true) {
		let max = hand[0];
		for (let i = 1; i < hand.length; i++) {
			if (hand[i].suit === hakam) {
				if (max.suit !== hakam) max = hand[i];
				else if (valueMap[hand[i].rank] >= valueMap[max.rank]) max = hand[i];
			} else if (hand[i].suit === currentSuit) {
				if (max.suit === hakam) continue;
				if (valueMap[hand[i].rank] >= valueMap[max.rank]) max = hand[i];
			}
		}

		hand = hand.filter(card => card.rank === "TEN");
		const data = {
			type: "CHANGE_HAND",
			mindies: hand,
			winnerId: max.id
		};
		stompClient.send("/topic/" + roomId, {}, JSON.stringify(data));
	}
}
async function CHANGE_HAND(data) {
	const winnerId = data.winnerId;
	const mindies = data.mindies;
	doneHands++;

	turn = false;
	firstPlayer = null;
	currentSuit = null;
	hand = [];

	await sleep(2000);
	if (winnerId % 2 === 0) changeScore(teamA, handsA, mindies, teamAMindies);
	else changeScore(teamB, handsB, mindies, teamBMindies);

	for (const player of players) document.getElementById(player.first).lastChild.src = '';

	if (doneHands === totalHands) {
		const winner = teamA.mindies.length > teamB.mindies.length ? "A" :
			teamA.mindies.length < teamB.mindies.length ? "B" :
				teamA.hands > teamB.hands ? "A" :
					teamA.hands < teamB.hands ? "B" : "Draw";
		const data = {
			type: "END_GAME",
			winner: winner
		};
		stompClient.send("/topic/" + roomId, {}, JSON.stringify(data));
	}

	document.getElementById(players[winnerId].first).firstChild.classList.add("current-turn");
	if (winnerId === indexId) turn = true;
	firstPlayer = winnerId;
}
function END_GAME(data) {
	const winner = data.winner;
	if (winner === "Draw") alert("DRAW!!!");
	else alert(`Team ${winner} won!!!`);
	RESET();
}
function RESET() {
	get("/game/end", {
		roomId: roomId
	}, (response) => {});

	teamA.hands = 0;
	teamA.mindies = [];
	teamB.hands = 0;
	teamB.mindies = [];

	gameStarted = false;
	turn = false;
	firstPlayer = null;
	hakam = null;
	currentSuit = null;
	suitCount = {"H":0, "S":0, "D":0, "C":0};
	hand = [];
	myCards = [];
	doneHands = 0;
	totalHands = 0;

	const scores = document.getElementsByClassName("scores");
	for(const element of scores)
		element.classList.add("hidden");

	playersArea.classList.remove(`grid${players.length}`);
	playersArea.innerHTML = '';
	myArea.innerHTML = '';

	handsA.innerHTML = '';
	handsB.innerHTML = '';
	teamAMindies.innerHTML = '';
	teamBMindies.innerHTML = '';
	hakamA.innerHTML = '';
	hakamB.innerHTML = '';

	if (roomCreator === true) {
		startGameButton.disabled = false;
		decks.disabled = false;
	}
}

function startNewGame() {
	startGameButton.disabled = true;

	const decks = document.getElementById("decks");
	decks.disabled = true;

	get('/game/start', {
		roomId: roomId,
		decks: decks.value
	}, (response) => {});
}
function updatePlayers() {
	playersA.innerHTML = '';
	playersB.innerHTML = '';

	for (let i = 0; i < players.length; i++) {
		if (players[i].first === userId) indexId = i;

		const new_row = document.createElement("li");
		new_row.classList.add("list-group-item");
		new_row.innerHTML = `${players[i].second}`;
		if (players[i].first === userId) new_row.classList.add("its-me");

		if (i % 2 === 0) playersA.appendChild(new_row);
		else playersB.appendChild(new_row);
	}

	decks.disabled = !roomCreator;
	startGameButton.disabled = !(roomCreator && players.length % 2 === 0);
}
function startGame() {
	const playersArea = document.getElementById("players-area");
	playersArea.classList.add(`grid${players.length}`);

	let id = firstPlayer;
	do {
		const player = players[id];
		const button = document.createElement("button");
		button.innerText = `${player.second}`;
		button.classList.add("players-name-btn");

		const card = document.createElement("img");
		card.classList.add("player-selected-card");

		const new_player = document.createElement("div");
		new_player.id = player.first;
		new_player.classList.add("player");

		new_player.appendChild(button);
		new_player.appendChild(card);
		playersArea.appendChild(new_player);

		id = (id + 1)%players.length;
	} while (id !== firstPlayer);

	if (firstPlayer === indexId) turn = true;

	document.getElementById(players[firstPlayer].first).firstChild.classList.add("current-turn");
	displayCards();
}
function displayCards() {
	myCards.sort((c1, c2) => {
		if(c1.suit === c2.suit) {
			if(valueMap[c1.rank] < valueMap[c2.rank]) return -1;
			else if(valueMap[c1.rank] > valueMap[c2.rank]) return 1;
			return 0;
		}
		if(valueMap[c1.suit] < valueMap[c2.suit]) return -1;
		return 1;
	});

	myArea.innerHTML = "";
	for (const card of myCards) {
		const new_card = document.createElement("img");
		new_card.classList.add("dashboard-img");
		new_card.src = `./images/${card.rank}${card.suit[0]}.png`;
		new_card.alt = `${card.rank} of ${card.suit}`;

		const new_card_a = document.createElement("a");
		new_card_a.id = `${card.rank}${card.suit[0]}`;
		new_card_a.addEventListener("click", clickOnCard, true);

		new_card_a.appendChild(new_card);
		myArea.appendChild(new_card_a);
	}
}
function clickOnCard() {
	if (turn === false) return;

	const rank = this.id.substr(0, this.id.length - 1);
	let suit = this.id[this.id.length - 1];

	if (currentSuit !== null) {
		if (suit !== currentSuit) {
			if (suitCount[currentSuit] > 0) return;
			if (hakam === null) {
				hakam = suit;
				const temp = hakam === "H" ? "Hearts" : hakam === "S" ? "Spades" : hakam === "D" ? "Diamonds" : "Clubs";
				document.getElementById(`hakam-${(indexId % 2 === 0) ? "a" : "b"}`).innerHTML = `Hakam = ${temp}`;
			}
		}
	} else currentSuit = suit;

	turn = false;
	suitCount[suit]--;
	myCards = myCards.filter(card => card.suit[0] !== suit || card.rank !== rank);
	let data = {
		type: "CHANGE_TURN",
		currentSuit: currentSuit,
		previous: indexId,
		hakam: hakam,
		card: {
			rank: rank,
			suit: suit
		}
	};
	stompClient.send("/topic/" + roomId, {}, JSON.stringify(data));
	displayCards();
}
function changeScore(team, hand, mindies, teamMindies) {
	team.hands++;
	for (const mindi of mindies) team.mindies.push(mindi);
	hand.innerHTML = `Hands = ${team.hands}`;
	for (const mindi of mindies) {
		const img = document.createElement("img");
		img.classList.add("score-img");
		img.src = `./images/TEN${mindi.suit[0]}.png`;
		const new_row = document.createElement("li");
		new_row.appendChild(img);
		teamMindies.appendChild(new_row);
	}
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
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
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