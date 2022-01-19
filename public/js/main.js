const socket = io();

// DOM elements
const elChatForm = document.querySelector('#chat-form');
const elMessage = document.querySelector('#msg');
const elMsgsContainer = document.querySelector('.chat-messages');
const elRoom = document.querySelector('#room-name');
const elUsers = document.querySelector('#users');

// Get Username & joined Room
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
socket.emit('joinRoom', { username, room });

function getElNewMessage(data) {
  const elMsgWrapper = document.createElement('div');
  elMsgWrapper.classList.add('message');

  const elTime = document.createElement('span');
  elTime.innerText = data.timestamp;

  const elMsgHead = document.createElement('p');
  elMsgHead.classList.add('meta');
  elMsgHead.innerHTML = `${data.username} `;
  elMsgHead.appendChild(elTime);

  const elMsgBody = document.createElement('p');
  elMsgBody.classList.add('text');
  elMsgBody.innerText = data.message;

  elMsgWrapper.appendChild(elMsgHead);
  elMsgWrapper.appendChild(elMsgBody);

  return elMsgWrapper;
}

function showChatMessage(data) {
  elMsgsContainer.appendChild(getElNewMessage(data));
  elMsgsContainer.scrollTop = elMsgsContainer.scrollHeight;
}

// DOM Events Listeners
elChatForm.addEventListener('submit', event => {
  event.preventDefault();

  // console.log('chat form', elMessage.value);
  socket.emit('sendMessage', elMessage.value);
  elMessage.value = '';
  elMessage.focus();
});

// Socket.io Events Listeners
socket.on('roomUsers', data => {
  elRoom.innerText = data.room;
  elUsers.innerHTML = data.users.map(user => `<li>${user.name}</li>`).join('');
});

socket.on('notification', notice => showChatMessage(notice));

socket.on('chatMessage', data => showChatMessage(data));
