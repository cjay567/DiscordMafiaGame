const playerdataUtil = require(`../util/playerdataUtil.js`);

module.exports.handler = async function(message) {
    // This function is called on every message event

    // Below is a basic command interpreter that is in every state file
    let commands = {
        "!startmafiagame": startmafiagame, // Called in order to start a game
        "!vote": vote, // Called in order to vote to perform actions
        "!joingame": joingame, // Called when a player wants to join a game
        "!leavegame": leavegame // Called when a player wants to leave a game
    };

    if (commands[message.content]) {
        commands[message.content](message);
    }
    // End command interpreter
}

module.exports.initializer = async function() {
    // This function is called when the state is switched to
}

async function startmafiagame (message) {
    
}

async function vote (message) {
    
}

async function joingame (message) {
    
}

async function leavegame (message) {
    
}