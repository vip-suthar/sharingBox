const Mega = require('megajs');
const email = process.env.MEGA_EMAIL;
const password = process.env.MEGA_PASSWORD;

let megaInstance = null;
module.exports = (async function () {
    if (megaInstance) return megaInstance;
    
    try {
        const megaClient = new Mega({ email, password });
        await megaClient.ready;
        console.log('Mega Service Ready');
        return megaInstance = megaClient;
    } catch (error) {
        console.log('Mega Service Error');
        return null;
    }
});