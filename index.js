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
 * playerdata.vote - Another playerdata object that this person has voted for (If they haven't voted then it's null/undefined and if they have opted for no one then it is set to true)
 * 
 * gamedata.currentsetup - Stores current role setup
 * format: ['M', 'V', 'V', 'V', 'D']
 * 
 * gamedata.guild - Stores the guild the server is using
 * gamedata.townchat - Stores #town-chat channel
 * gamedata.mafiachat - Stores #mafia-chat channel
 * gamedata.doctorchat - Stores #doctor-chat channel
 * gamedata.deadchat - Stores #dead-chat channel
 * gamedata.sheriffchat - Stores #sheriff-chat channel
 * 
 * gamedata.currentcycle - Stores number that corresponds to the current amount of night/day cycles
 * gamedata.winner - Stores a string corresponding to what team won the game ("town" for town, "mafia" for mafia)
 */
let gamedata = global.gamedata = {};

function setGameState(gamestate) { // Use this function to change the game state
  gamedata.currentstate = gamestate;
  console.log("State set to: " + gamestate);
  gamestates[gamedata.currentstate].initializer && gamestates[gamedata.currentstate].initializer(); // Run the initalizer for that state if there is one
}
global.setGameState = setGameState;

client.on(`ready`, async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  gamedata.winner = undefined;
  gamedata.currentplayers = [];
  // gamedata.currentsetup = ['M', 'S', 'V', 'V', 'D']; // Actual setup
  gamedata.currentsetup = ['M', 'M', 'D', 'S', 'V', 'V', 'V']; // Actual setup
  // gamedata.currentsetup = ['M', 'S']; // Dev testing setup
  gamedata.currentcycle = 1;


  // Finds guild and channels that are needed for the game
  gamedata.guild = client.guilds.resolve(tokenFile.guildId);
  if (!gamedata.guild) {
    console.error("Invalid guild id in token file.");
    return;
  }

  gamedata.townchat = gamedata.guild.channels.find(channel => channel.name === "town-chat");
  gamedata.mafiachat = gamedata.guild.channels.find(channel => channel.name === "mafia-chat");
  gamedata.doctorchat = gamedata.guild.channels.find(channel => channel.name === "doctor-chat");
  gamedata.deadchat = gamedata.guild.channels.find(channel => channel.name === "dead-chat");
  gamedata.sheriffchat = gamedata.guild.channels.find(channel => channel.name === "sheriff-chat");

  if (!gamedata.townchat) {
    gamedata.townchat = await gamedata.guild.channels.create("town-chat", { permissionOverwrites: [{ id: gamedata.guild.defaultRole, deny: ["VIEW_CHANNEL", "SEND_MESSAGES"], type: "role" }]});
    if (!gamedata.townchat) {
      console.error("Cannot create channel named \"#town-chat\"");
      return;
    } else {
      console.log("Created channel \"#town-chat\"");
    }
  }

  if (!gamedata.mafiachat) {
    gamedata.mafiachat = await gamedata.guild.channels.create("mafia-chat", { permissionOverwrites: [{ id: gamedata.guild.defaultRole, deny: ["VIEW_CHANNEL", "SEND_MESSAGES"], type: "role" }]});
    if (!gamedata.mafiachat) {
      console.error("Cannot create channel named \"#mafia-chat\"");
      return;
    } else {
      console.log("Created channel \"#mafia-chat\"");
    }
  }

  if (!gamedata.doctorchat) {
    gamedata.doctorchat = await gamedata.guild.channels.create("doctor-chat", { permissionOverwrites: [{ id: gamedata.guild.defaultRole, deny: ["VIEW_CHANNEL", "SEND_MESSAGES"], type: "role" }]});
    if (!gamedata.doctorchat) {
      console.error("Cannot create channel named \"#doctor-chat\"");
      return;
    } else {
      console.log("Created channel \"#doctor-chat\"");
    }
  }

  if (!gamedata.sheriffchat) {
    gamedata.sheriffchat = await gamedata.guild.channels.create("sheriff-chat", { permissionOverwrites: [{ id: gamedata.guild.defaultRole, deny: ["VIEW_CHANNEL", "SEND_MESSAGES"], type: "role" }]});
    if (!gamedata.sheriffchat) {
      console.error("Cannot create channel named \"#sheriff-chat\"");
      return;
    } else {
      console.log("Created channel \"#sheriff-chat\"");
    }
  }

  if (!gamedata.deadchat) {
    gamedata.deadchat = await gamedata.guild.channels.create("dead-chat", { permissionOverwrites: [{ id: gamedata.guild.defaultRole, allow: ["SEND_MESSAGES"], deny: ["VIEW_CHANNEL"], type: "role" }]});
    if (!gamedata.deadchat) {
      console.error("Cannot create channel named \"#dead-chat\"");
      return;
    } else {
      console.log("Created channel \"#dead-chat\"");
    }
  }

  // TODO: Check to make sure the bot can edit the permissions of the channels above before starting the game

  setGameState("nogame");

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

    if (message.guild != gamedata.guild) { // Only accept messages from the assigned guild
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