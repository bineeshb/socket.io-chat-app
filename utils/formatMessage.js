const moment = require('moment');

function formatMessage(userId, username, message) {
  return {
    userId,
    username,
    message,
    timestamp: moment().format('h:mm a')
  };
}

module.exports = formatMessage;
