const Discord = require('discord.js');
const client = new Discord.Client();

const path = require('path');
const fs = require('fs');
const _ = global._ = require('lodash');

const tokenFile = require(`./config/token.js`);

/* 
Possible states:
1. "nogame" - Game currently not going on, only respond to !startmafiagame
2. "queue" - Game is being queued up, respond to !joingame and !leavegame
3. "pregame" - Lasts 20 seconds, People get DMed their roles.
4. "night" - Right after pregame phase and day phase, doctor votes to heal and mafia vote to kill
5. "day" - Dead/healed are announced and all players vote on who to lynch
6. "postgame" - Once a win condition has been met all player's roles are revealed and the game ends, post game allows players to chat for 20 seconds until town-chat is locked
*/

let gamestates = {};

/**
 * gamedata.currentstate - Holds the current game state
 * 
 * gamedata.currentplayers - A array of playerdata objects
 * playerdata objects contains:
 * playerdata.member - Member object of player
 * playerdata.role - Role of player
 * playerdata.alive - alive: true, dead: false
 * 
 * gamedata.currentsetup - Stores current role setup
 * format: ['M', 'V', 'V', 'V', 'D']
 * 
 * gamedata.guild - Stores the guild the server is using
 * gamedata.townchat - Stores #town-chat channel
 * gamedata.mafiachat - Stores #mafia-chat channel
 * gamedata.doctorchat - Stores #doctor-chat channel
 */
let gamedata = global.gamedata = {};

function setGameState(gamestate) { // Use this function to change the game state
  gamedata.currentstate = gamestate;

  gamestates[gamedata.currentstate].initializer && gamestates[gamedata.currentstate].initializer(); // Run the initalizer for that state if there is one
}

client.on(`ready`, () => {
  console.log(`Logged in as ${client.user.tag}!`);

  gamedata.currentstate = "nogame";
  gamedata.currentplayers = [];
  //gamedata.currentsetup = ['M', 'V', 'V', 'V', 'D'];
  gamedata.currentsetup = ['M', 'V'];


  // Finds guild and channels that are needed for the game
  gamedata.guild = client.guilds.resolve(tokenFile.guildId);
  if (!gamedata.guild) {
    console.error("Invalid guild id in token file.");
    return;
  }

  gamedata.townchat = guild.channels.find(channel => channel.name === "town-chat");
  gamedata.mafiachat = guild.channels.find(channel => channel.name === "mafia-chat");
  gamedata.doctorchat = guild.channels.find(channel => channel.name === "doctor-chat");

  if (!gamedata.townchat) {
    console.error("Cannot find channel named \"#town-chat\"");
    return;
  }

  if (!gamedata.mafiachat) {
    console.error("Cannot find channel named \"#mafia-chat\"");
    return;
  }

  if (!gamedata.doctor) {
    console.error("Cannot find channel named \"#doctor-chat\"");
    return;
  }

  // TODO: Check to make sure the bot can edit the permissions of the channels above before starting the game

  initializeEventHanders();
});

function initializeEventHanders() { // Don't call this before everything is initialized, it actually starts the bot
  client.on(`message`, async message => {
    if (message.author.bot) { // Ignore all messages from any bots
      return;
    }
  
    if (message.channel.type === "dm") { // Ignore all DMs
      return;
    }
  
    await gamestates[gamedata.currentstate].handler(message); // Send the message event and current global data to the handler for the current state
  });
}



const directoryPath = path.join(__dirname, 'gamestates');

fs.readdir(directoryPath, function (err, files) { // Load all gamestate files 
  if (err) {
    return console.log('Unable to load gamestate files: ' + err);
  }

  files.forEach(function (file) {
    gamestates[file.slice(0, -3)] = require(`./gamestates/${file}`); // Cut off the ".js" portion of the name and use that to register it
  });
});

client.login(tokenFile.discordToken);