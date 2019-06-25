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
    // Post message in #town-chat saying that it's day
    // Open #town-chat for all players
    // Send message saying that the town can now vote on who to lynch
}

function endDay() { // Call when voting ends
    // Close #town-chat
    // Calculate the lynch results
    // Post message in #town-chat saying what happened
    // Check for win condition
    // Increment cycle counter
    // If win condition met then switch to postgame state
    // else switch to night state
}

async function startmafiagame (message) {
    await message.channel.send(`A game has already started!`);
}

async function vote (message) {
    // Check to make sure player is alive
    // Update player's vote
    // Check to see if all players that can vote have voted
    // If they have call endDay()
}

async function joingame (message) {
    await message.channel.send(`A game has already started!`);
}

async function leavegame (message) {
    // TODO: Handle a user leaving mid-game
    // Make it so they have to do "!leavegame yes" or something so they have to make sure
    // Set the user's "alive" to false
    // Check for win conditions, if condition met then move to postgame state
}