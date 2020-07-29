const usernamePage = document.querySelector('#username-page');
const usernameForm = document.querySelector('#usernameForm');
const connectingElement = document.querySelector('.connecting');
const joinRoom = document.querySelector("#join-room-text");
const URL = "http://localhost:8081";

let userId = null;
let username = null;
let roomId = null;
let socket = null;
let stompClient = null;

const colors = ['#2196F3', '#32c787', '#00BCD4', '#ff5652', '#ffc107',
	'#ff85af', '#FF9800', '#39bbb0'];

usernameForm.addEventListener('submit', connect, true);

function connect(event) {
	userId = uuidv4();
	username = document.querySelector('#user-name').value;

	if(username.trim()) {
		const join = document.getElementById("join-room");

		if(join.checked) {
			roomId = document.getElementById("room-id").value;
			if(roomId.trim()) {
				try{
					$.post(URL + "/rooms/join", JSON.stringify({
						userId: userId,
						userName: username,
						roomId: roomId
					}), () => {
						createSocket();
					});
				} catch(err) {
					console.log(err.message);
					alert(err.message);
				}
			}
			else alert("Enter valid room id");
		}
		
		else {
			try{
				$.post(URL + "/rooms/create", JSON.stringify({
					userId: userId,
					userName: username,
					roomId: ''
				}), (response) => {
					roomId = response;
					createSocket();
				});
			} catch(err) {
				console.log(err.message);
				alert(err.message);
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
	usernamePage.classList.add('hidden');

	socket = new SockJS("/ng-knt");
	stompClient = Stomp.over(socket);
	stompClient.connect({}, onConnected, onError);
}

function onConnected() {
	stompClient.subscribe("/topic/" + roomId, onMessageReceived);
}

function onError(error) {
	alert(error.message);
}

function sendMessage(event) {
	var messageContent = messageInput.value.trim();
	if (messageContent && stompClient) {
		var Message = {
			senderId: userId,
			senderName: username,
			roomId: roomId,
			message : messageInput.value,
			type : 'CHAT'
		};
		stompClient.send("/app/chat", {}, JSON
				.stringify(Message));
		messageInput.value = '';
	}
	
	event.preventDefault();
}

function onMessageReceived(payload) {
	var message = JSON.parse(payload.body);

	var messageElement = document.createElement('li');

	if (message.type == 'JOIN') {
		messageElement.classList.add('event-message');
		messageElement.classList.add('join-event');
		message.message = message.senderName + ' joined!';
		} else if (message.type == 'LEAVE') {
		messageElement.classList.add('event-message');
		messageElement.classList.add('leave-event');
		message.message = message.senderName + ' left!';
	} else {
		messageElement.classList.add('chat-message');
		if(message.senderId === userId)
			messageElement.classList.add("my-message");

		var avatarElement = document.createElement('i');
		var avatarText = document.createTextNode(message.senderName[0]);
		avatarElement.appendChild(avatarText);
		avatarElement.style['background-color'] = getAvatarColor(message.senderName);

		messageElement.appendChild(avatarElement);

		var usernameElement = document.createElement('span');
		var usernameText = document.createTextNode(message.senderName);
		usernameElement.appendChild(usernameText);
		messageElement.appendChild(usernameElement);
	}

	var textElement = document.createElement('p');
	var messageText = document.createTextNode(message.message);
	textElement.appendChild(messageText);

	messageElement.appendChild(textElement);

	messageArea.appendChild(messageElement);
	messageArea.scrollTop = messageArea.scrollHeight;
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
	  const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
  });
}