const playerdataUtil = require(`../util/playerdataUtil.js`);

module.exports.handler = async function(message) {
    
    let commands = {
        "!startmafiagame": startmafiagame, // Called in order to start a game
        "!vote": vote, // Called in order to vote to perform actions
        "!joingame": joingame, // Called when a player wants to join a game
        "!leavegame": leavegame // Called when a player wants to leave a game
    };

    if (commands[message.content]) {
        commands[message.content](message);
    }
}

module.exports.initializer = async function() {
    // Message #town-chat that the game is preparing
    // Edit permissions to allow all players to talk in #town-chat
    // Assign players their roles and DM them their roles
    // Allow the doctor to see #doctor-chat and allow the mafia to see #mafia-chat
    // Set every player to be alive
    // Message #town-chat that 20 second pregame period has begun
    // Start timeout and set it to timeoutToStart

    // When timeout ends move to night 
}

let timeoutToStart;

async function startmafiagame (message) {
    await message.channel.send(`A game has already started!`);
}

async function vote (message) {
    await message.channel.send(`That can only be used during day/night phases.`);
}

async function joingame (message) {
    await message.channel.send(`A game has already started!`);
}

async function leavegame (message) {
    if (playerdataUtil.removePlayer(message.member)) {
        setGameState("queue");
        clearTimeout(timeoutToStart);
        playerdataUtil.clearRoleData();

        message.channel.send(`${message.member.displayName} has left the game. The Game is now cancelled. The queue to join is open again. \`${gamedata.currentplayers.length}/${gamedata.currentsetup.length}\` players.`);
    } else {
        message.channel.send(`You are not in the game!`);
    }
}