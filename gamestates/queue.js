const playerdataUtil = require(`../util/playerdataUtil.js`);

module.exports.handler = async function(message) {
    
    let commands = {
        "!startmafiagame": startmafiagame, // Called in order to start a game
        "!vote": vote, // Called in order to vote to perform actions
        "!joingame": joingame, // Called when a player wants to join a game
        "!leavegame": leavegame // Called when a player wants to leave a game
    };

    if (commands[message.content.split(" ")[0]]) {
        commands[message.content.split(" ")[0]](message); // Gets the fisrt word of the message
    }
}

async function startmafiagame (message) {
    await message.channel.send(`A game queue has already started! Use !joingame to join it.`);
}

async function vote (message) {
    await message.channel.send(`That command can only be used when a game is running. Use !joingame to join the current queue.`);
}

async function joingame (message) {
    if (gamedata.currentplayers.length >= gamedata.currentsetup.length) { // Prevent bugs
        return;
    }

    if (playerdataUtil.addPlayer(message.member)) {
        message.channel.send(`${message.member.user} has joined the queue. Leave the queue with !leavegame \`${gamedata.currentplayers.length}/${gamedata.currentsetup.length}\` players.`);
    } else {
        message.channel.send(`You are already in the queue! Leave with !leavegame`);
    }

    checkIfStateFinished();
}

async function leavegame (message) {
    if (playerdataUtil.removePlayer(message.member)) {
        message.channel.send(`${message.member.user} has left the queue. Join the queue with !joingame \`${gamedata.currentplayers.length}/${gamedata.currentsetup.length}\` players.`);
    } else {
        message.channel.send(`You are not in the queue! Join with !joingame`);
    }

    checkIfStateFinished(message);
}

async function checkIfStateFinished(message) { // Checks to see if the queue state is done
    if (gamedata.currentplayers.length === gamedata.currentsetup.length) {
        setGameState(`pregame`); // Start game
    } 

    if (gamedata.currentplayers.length === 0) {
        setGameState(`nogame`); // End queue

        message.channel.send(`All players have left the queue. The game has been cancelled.`);
    }
}