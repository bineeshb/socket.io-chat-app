const users = [];
let usersTyping = [];

function userJoin(id, name, room) {
  const user = { id, name, room };
  users.push(user);
  return user;
}

function getUserById(id) {
  return users.find(user => user.id === id);
}

function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    userStoppedTyping(users[index].id);
    return users.splice(index, 1)[0];
  }
}

function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

function userTyping(id) {
  let user = usersTyping.find(user => user.id === id);

  if (!user) {
    user = getUserById(id);
    usersTyping.push(user);
  }

  return user;
}

function userStoppedTyping(id) {
  const user = getUserById(id);
  usersTyping = usersTyping.filter(user => user.id !== id);
  return user;
}

function getUsersTyping() {
  return usersTyping;
}

module.exports = {
  getRoomUsers,
  getUserById,
  getUsersTyping,
  userJoin,
  userLeave,
  userStoppedTyping,
  userTyping
};
