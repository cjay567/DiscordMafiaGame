const playerdataUtil = require(`../util/playerdataUtil.js`);
const discordUtil = require(`../util/discordUtil.js`);

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
    // Lock all chats
    // Announce game has ended in #town-chat
    // Declare winner from gamedata.winner in #town-chat
    // List every player, their role, and whether or not theyre alive
    // Open mafiachat and doctorchat for all players to view
    // Announce that all the chats will be closed in 20 seconds
    // Open #town-chat and let players talk there
    // Wait for 20 seconds
    // Lock all chats
    // Post a message in every channel saying that the previous game has ended (This is so different game's messages aren't confused with eachother)
    // Remove every permission overwrite in every channel
    // Reset gamedata.currentplayers, gamedata.winner, gamedata.currentcycle
    // Switch to state nogame
}

async function startmafiagame (message) {
    // Send message saying to wait
}

async function vote (message) {
    // Send message saying game is over
}

async function joingame (message) {
    // Send message saying to wait
}

async function leavegame (message) {
    // Send message saying to wait
}