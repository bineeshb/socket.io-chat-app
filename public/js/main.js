const socket = io();

// DOM elements
const elChatForm = document.querySelector('#chat-form');
const elMessage = document.querySelector('#msg');
const elMsgsContainer = document.querySelector('.chat-messages');
const elRoom = document.querySelector('#room-name');
const elUsers = document.querySelector('#users');
const elFeedback = document.querySelector('#feedback');

// Get Username & joined Room
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
socket.emit('joinRoom', { username, room });

function getElNewMessage(data, isSelfMessage = false) {
  const elMsgWrapper = document.createElement('div');
  elMsgWrapper.classList.add('message');

  const elTime = document.createElement('span');
  elTime.innerText = data.timestamp;

  const elMsgHead = document.createElement('p');
  elMsgHead.classList.add('meta');

  if (!isSelfMessage) {
    elMsgHead.innerHTML = `${data.username} `;
  }

  elMsgHead.appendChild(elTime);

  const elMsgBody = document.createElement('p');
  elMsgBody.classList.add('text');
  elMsgBody.innerText = data.message;

  elMsgWrapper.appendChild(elMsgHead);
  elMsgWrapper.appendChild(elMsgBody);

  const elWrapper = document.createElement('div');
  elWrapper.appendChild(elMsgWrapper);

  if (isSelfMessage) {
    elWrapper.classList.add('self-message');
  }

  return elWrapper;
}

function getElNewNotice(notice) {
  const elTime = document.createElement('span');
  elTime.classList.add('notification-time');
  elTime.innerText = notice.timestamp;

  const elNotice = document.createElement('div');
  elNotice.classList.add('notification');
  elNotice.appendChild(elTime);
  elNotice.innerHTML += ` ${notice.message}`;

  return elNotice;
}

function showMessage(elNewMessage) {
  elMsgsContainer.appendChild(elNewMessage);
  elMsgsContainer.scrollTop = elMsgsContainer.scrollHeight;
}

// DOM Events Listeners
elMessage.addEventListener('keypress', () => socket.emit('typing'));

elChatForm.addEventListener('submit', event => {
  event.preventDefault();

  socket.emit('sendMessage', elMessage.value);
  elMessage.value = '';
  elMessage.focus();
});

// Socket.io Events Listeners
socket.on('roomUsers', data => {
  elRoom.innerText = data.room;
  elUsers.innerHTML = data.users.map(user => `<li>${user.name}</li>`).join('');
});

socket.on('notification', notice => showMessage(getElNewNotice(notice)));

socket.on('chatMessage', data => {
  elFeedback.innerText = '';
  showMessage(getElNewMessage(data, data.username === username));
});

socket.on('feedback', data => elFeedback.innerHTML = `<em>${data}</em>`);
