/* const tmi = require('tmi.js');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Set up your Twitch bot's options here
const opts = {
    identity: {
      username: 'clickbottest',
      password: 'oauth:l18m1y0gecqcn4k41tooswygw1802m'
    },
    channels: [
      'clickbottest'
      
    ]
  };


// Create a new Twitch bot instance
const bot = new tmi.client(opts);

// Set up your WebSocket server
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

bot.connect().then(() => {
    bot.join(opts.channels[0]);
  });

// Set up your routes and middleware here
app.get('/', (req, res) => {
    // Handle requests to your front-end here
});

let clickCount = 0;

// Add an event listener for chat votes
const gameState = { option1Votes: 0, option2Votes: 0 };
bot.on('message', (channel, tags, message, self) => {
    if (message.startsWith('!click')) {
        // Increment the click count
        clickCount++;
    
        // Log the new click count
        console.log(`Clicked ${clickCount} times`);
    }

    if (message.startsWith('!vote ')) {
        // Parse the vote from the message
        const vote = message.substr(6).toLowerCase();

        // Update the game state based on the vote
        if (vote === 'option1') {
            gameState.option1Votes++;
            console.log('voted for option1');
        } else if (vote === 'option2') {
            gameState.option2Votes++;
            console.log('voted for option2');
        }
         else {
            // Invalid vote
            console.log('invalid vote');
            return;
        }

        // Send an update to the front-end via WebSocket
        io.emit('gameStateUpdate', gameState);
    }
   
});



// Add an event listener for when your bot connects to Twitch
bot.on('connected', (address, port) => {
    console.log(`Connected to ${address}:${port}`);
});

// Start your server
server.listen(3000, () => {
    console.log('Server started on port 3000');
});

// Set up a WebSocket connection with the client
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle incoming WebSocket messages here
});
 */

const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const tmi = require('tmi.js');
const ejs = require('ejs');

// Set up your Twitch bot's options here
const opts = {
  identity: {
    username: 'clickbottest',
    password: 'oauth:l18m1y0gecqcn4k41tooswygw1802m'
  },
  channels: ['clickbottest']
};

// Create a new Twitch bot instance
const bot = new tmi.client(opts);



// Set up your routes and middleware here
app.get('/', (req, res) => {
  // Render the index.ejs template and pass in the clickCount variable
  res.render('index', { clickCount, option1Votes, option2Votes, winningOption, clickMultiplier });
});

// Initialize clickCount to 0
let clickCount = 0;
let option1Votes = 0;
let option2Votes = 0;
let winningOption = null ;
let clickMultiplier = 1;
let cost1 = 10
let option1Cost = 10;
let option2Cost = 50;
let autoClickRate = 1;
let autoClickerInterval = null; // Define autoClickerInterval as null initially



bot.on('message', (channel, tags, message, self) => {
    if (message === message) {
      let multiplier = clickMultiplier;
      if (multiplier === null) {
        multiplier = 1;
      }
      clickCount += multiplier;
      console.log(`Clicked ${clickCount} times`);
      
      if (message.startsWith('!vote ')) {
        // Parse the vote from the message
        const vote = message.substr(6).toLowerCase();
      
        // Update the game state based on the vote
        if (vote === 'option1') {
          if (clickCount >= option1Cost) {
            clickCount -= option1Cost;
            option1Votes++;
            option1Cost *= 1;
            console.log(`Clicked ${clickCount} times`);
            console.log(`Voted for option1 (cost is now ${option1Cost} clicks)`);
          } else {
            bot.say(channel, `You do not have enough clicks to vote for option1. Current cost is ${option1Cost} clicks and we are at ${clickCount}.`);
          }
        } else if (vote === 'option2') {
          if(clickCount >= option2Cost) {
            option2Votes++;
          console.log(`Clicked ${clickCount} times`);
          console.log('Voted for option2');
          clickCount -= option2Cost;
          option2Cost *= 2.5;
          } else{
            bot.say(channel, `You do not have enough clicks to vote for option2. Current cost is ${option2Cost} clicks and we are at ${clickCount}.`);
          }
        } else {
          // Invalid vote
          console.log('Invalid vote');
          bot.say(channel, `Invalid vote. You must vote for either option1 or option2.`);
          return;
        }
      }
      
      
      io.emit('clickCountUpdate', clickCount);
    }
  });
  

  
  

  const calculateWinningOption = () => {
    if (option1Votes > option2Votes) {
      winningOption = 'option1';
      clickMultiplier *= 2; // Double the click multiplier
      option1Cost *= 4; // Increase the cost of option 1 by 4x
      console.log(`Option 1 wins! Click multiplier is now ${clickMultiplier}`);

    } else if (option2Votes > option1Votes) {
      winningOption = 'option2';
      option2Cost *= 2; // Double the cost of option 2
      console.log(`Option 2 wins! Cost is now ${option2Cost}`);

      if (winningOption === 'option2') {
        clearInterval(autoClickerInterval); // Stop the previous auto clicker interval
        autoClickerInterval = setInterval(() => {
          clickCount += autoClickRate * clickMultiplier; // Increment click count by 2 every second
          io.emit('clickCountUpdate', clickCount);
          console.log(`Clicked ${clickCount} times`);

        }, 1000);
      }
    } else {
      winningOption = 'a tie';
      console.log('No winner yet');
    }
  
    // Reset the vote counts
    option1Votes = 0;
    option2Votes = 0;
  };
  
  
  // Call the winningOption function every 30 seconds
  setInterval(calculateWinningOption, 30000);
  
  // Call the setInterval every 5 minutes
  setInterval(() => {
    setInterval(calculateWinningOption, 30000);
  }, 60000);
  


// Connect your bot to Twitch
bot.connect();

// Set up a WebSocket connection with the client
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Send the initial click count to the client
  io.emit('clickCountUpdate', clickCount);
});

// Start your server
http.listen(3000, () => {
  console.log('Server started on port 3000');
});


