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
    let startMsg = `Game is starting with: `
    for (player in gamedata.currentplayers) {
        startMsg += `\n\`` + player.member.displayName + `\``;
    }
    startMsg += `\`DMing players their roles now.`;
    await gamedata.townchat.send(startMsg);

    // Edit permissions to allow all players to talk in #town-chat
    let tempPromises = []; // This variable is gonna be used to store promises that are waiting to resolve
    for (player in gamedata.currentplayers) {
        tempPromises.push(gamedata.townchat.createOverwrite(player.member, {'SEND_MESSAGES': true}));
    }
    await Promise.all(tempPromises);

    // Assign players their roles and DM them their roles
    // Set every player to be alive
    let roleArray = _.clone(gamedata.currentsetup); // Make a clone of the setup as to not change the original
    _.shuffle(roleArray);
    tempPromises = [];
    for (let i = 0; i < gamedata.currentplayers.length; i++) {
        gamedata.currentplayers[i].role = roleArray[i];
        gamedata.currentplayers[i].alive = true;
        tempPromises.push(sendPlayerRole(gamedata.currentplayers[i])); // DMs the player their role with custom messages for each role
    }
    

    // Allow the doctor to see #doctor-chat and allow the mafia to see #mafia-chat
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
    if (!timeoutToStart) { // Game is still preparing, player can't leave now or it'll mess stuff up
        return;
    }

    if (playerdataUtil.removePlayer(message.member)) {
        setGameState("queue");
        clearTimeout(timeoutToStart);
        playerdataUtil.clearRoleData();

        message.channel.send(`${message.member.displayName} has left the game. The Game is now cancelled. The queue to join is open again. \`${gamedata.currentplayers.length}/${gamedata.currentsetup.length}\` players.`);
    } else {
        message.channel.send(`You are not in the game!`);
    }
}

async function sendPlayerRole(player) { // Reminder: Make sure to not return a promise with his
    
}