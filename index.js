const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const formatMessage = require('./utils/formatMessage');
const { getRoomUsers, getUserById, getUsersTyping, userJoin, userLeave, userStoppedTyping, userTyping } = require('./utils/users');

const PORT = 3000;
const CHATBOT = 'ChatBot';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => console.log(`Server is running in port ${PORT} ...`));

io.on('connection', socket => {
  const emitRoomUsers = room => {
    io.to(room).emit('roomUsers', {
      room,
      users: getRoomUsers(room)
    });
  };

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit('notification', formatMessage(CHATBOT, CHATBOT, 'Welcome to Chat App !'));

    socket.broadcast
      .to(user.room)
      .emit('notification', formatMessage(CHATBOT, CHATBOT, `${user.name} has joined !`));

    emitRoomUsers(user.room);
  });

  socket.on('typing', () => {
    const user = userTyping(socket.id);

    socket.broadcast
      .to(user.room)
      .emit('feedback', getUsersTyping());
  });

  socket.on('stoppedTyping', () => {
    const user = userStoppedTyping(socket.id);

    socket.broadcast
      .to(user.room)
      .emit('feedback', getUsersTyping());
  });

  socket.on('sendMessage', message => {
    const user = getUserById(socket.id);

    io.to(user.room).emit('chatMessage', formatMessage(user.id, user.name, message));
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      socket.broadcast
        .to(user.room)
        .emit('notification', formatMessage(CHATBOT, CHATBOT, `${user.name} has left !`));

      emitRoomUsers(user.room);
    }
  })
});
