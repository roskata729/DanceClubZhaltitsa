const { format } = require('timeago.js');

const helpers = {};

helpers.timeago = (timestamp) => {
    return format(timestamp, 'EEEE, MMMM, dd');
}

module.exports = helpers;