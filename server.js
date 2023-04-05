const express = require('express');
const path = require('path');
const cors = require('cors');
// require('dotenv').config({path: path.join(__dirname, '.env.local')});
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const app = express();

// Cors 
app.use(cors());

connectDB();

app.use(express.static(path.join(__dirname, `/public`)));
app.use(express.json());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// Routes 
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, console.log(`Listening on port ${PORT}.`));