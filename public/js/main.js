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

let lastMessage = null;

function getElMessageHead(username, timestamp, isSelfMessage) {
  const elMsgHead = document.createElement('p');
  elMsgHead.classList.add('meta');

  if (!isSelfMessage) {
    elMsgHead.innerHTML = `${username} `;
  }

  const elTime = document.createElement('span');
  elTime.innerText = timestamp;
  elMsgHead.appendChild(elTime);

  return elMsgHead;
}

function getElNewMessage(data, isSelfMessage = false) {
  const elMsgBody = document.createElement('p');
  elMsgBody.classList.add('text');
  elMsgBody.innerText = data.message;

  const elMsgWrapper = document.createElement('div');
  elMsgWrapper.classList.add('message');

  if (!lastMessage || lastMessage.userId !== data.userId) {
    const elMsgHead = getElMessageHead(data.username, data.timestamp, isSelfMessage);
    elMsgWrapper.appendChild(elMsgHead);
  } else {
    elMsgWrapper.classList.add('continuous-message');
  }

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

function getTypingText(users) {
  let feedback = '';
  const usersTyping = users.filter(user => user.id !== socket.id);

  if (usersTyping?.length > 2) {
    feedback = '3 or more are typing...';
  } else if (usersTyping?.length === 2) {
    feedback = `${usersTyping[0].name} and ${usersTyping[1].name} are typing...`;
  } else if (usersTyping?.length > 0) {
    feedback = `${usersTyping[0].name} is typing...`;
  }

  return feedback;
}

// DOM Events Listeners
elMessage.addEventListener('keypress', () => socket.emit('typing'));
elMessage.addEventListener('blur', () => socket.emit('stoppedTyping'));

elChatForm.addEventListener('submit', event => {
  event.preventDefault();
  socket.emit('sendMessage', elMessage.value);
  socket.emit('stoppedTyping');
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
  showMessage(getElNewMessage(data, data.userId === socket.id));
  lastMessage = data;
});

socket.on('feedback', users => {
  const feedback = users?.length > 0 ? getTypingText(users) : null;
  elFeedback.innerHTML = !!feedback ? `<em>${feedback}</em>` : '';
});
