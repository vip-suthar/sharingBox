require('dotenv').config();
const mongoose = require('mongoose');

let dbInstance = null;
module.exports = (function () {
    if (dbInstance) return dbInstance;
    // Database connection
    mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true });
    const connection = mongoose.connection;
    return connection.once('open', () => {
        console.log('Database connected');
        dbInstance = connection;
        return dbInstance;
    }).catch(err => {
        console.log('Database connection failed');
        return null;
    });
});