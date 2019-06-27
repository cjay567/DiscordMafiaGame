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

module.exports.initializer = async function(message) {
    await playerdataUtil.removeChannelPermissionOverwrites();
}

async function startmafiagame (message) {
    if (playerdataUtil.addPlayer(message.member)) {
        setGameState("queue"); // Begin queueing up players
        
        message.channel.send(`Game queue started! \`${gamedata.currentplayers.length}/${gamedata.currentsetup.length}\` players.`);
    } else {
        message.channel.send(`Failed to start game`);
    }
}

async function vote (message) {
    await message.channel.send(`That command can only be used when a game is running. Start one with !startmafiagame.`);
}

async function joingame (message) {
    await message.channel.send(`A game hasn't started yet! Start one with !startmafiagame.`);
}

async function leavegame (message) {
    await message.channel.send(`A game hasn't started yet! Start one with !startmafiagame.`);
}