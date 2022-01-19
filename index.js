const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const formatMessage = require('./utils/formatMessage');
const { getCurrentUser, getRoomUsers, userJoin, userLeave } = require('./utils/users');

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

    socket.emit('notification', formatMessage(CHATBOT, 'Welcome to Chat App !'));

    socket.broadcast
      .to(user.room)
      .emit('notification', formatMessage(CHATBOT, `${user.name} has joined !`));

    emitRoomUsers(user.room);
  });

  socket.on('sendMessage', message => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('chatMessage', formatMessage(user.name, message));
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      socket.broadcast
        .to(user.room)
        .emit('notification', formatMessage(CHATBOT, `${user.name} has left !`));

      emitRoomUsers(user.room);
    }
  })
});
