const express = require('express');
const app = express();

// Set up your routes and middleware here
app.get('/', (req, res) => {
    // Handle requests to your front-end here
});

// Start your server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});

const http = require('http');
const server = http.createServer((req, res) => {
    // ...
});

const io = require('socket.io')(server);


// Set up a WebSocket connection with the client
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Handle incoming WebSocket messages here
});

setInterval(() => {
    location.reload();
    console.log('reloaded');
  }, 3000);


