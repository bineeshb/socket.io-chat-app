const moment = require('moment');

function formatMessage(username, message) {
  return {
    username,
    message,
    timestamp: moment().format('h:mm a')
  };
}

module.exports = formatMessage;
