const Mega = require('megajs');
const email = process.env.MEGA_EMAIL;
const password = process.env.MEGA_PASSWORD;
const megaClient = new Mega({ email, password });

module.exports = megaClient;