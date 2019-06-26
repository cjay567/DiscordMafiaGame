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
    //  await gamedata.townchat.send(`Thank you for playing! The chats will be closed in 20 seconds`);
    // Declare winner from gamedata.winner in #town-chat
    // List every player, their role, and whether or not theyre alive
    // Open mafiachat and doctorchat for all players to view
    // Announce that all the chats will be closed in 20 seconds
    // Open #town-chat and let players talk there
    // Wait for 20 seconds
    /* 
        // Start timeout and set it to timeoutToStart
        await new Promise((resolve, reject) => {
        timeoutToStart = setTimeout(resolve, 20000); // Timeout for 20 seconds
        });

        if (gamedata.currentstate !== "pregame") { // Prevents bugs
            return;
        }
    */
    // Lock all chats
    // Post a message in every channel saying that the previous game has ended (This is so different game's messages aren't confused with eachother)
    /* 
        gamedata.townchat.send("```PREVIOUS GAME ENDED```");
        gamedata.mafiachat.send("```PREVIOUS GAME ENDED```");
        gamedata.doctorchat.send("```PREVIOUS GAME ENDED```");
    */
    // Remove every permission overwrite in every channel
    // Reset gamedata.currentplayers, gamedata.winner, gamedata.currentcycle
    // Switch to state nogame
    /*     setGameState("nogame") 
    */
}

async function startmafiagame (message) {
    await message.channel.send(`A game is about to finish, please wait!`);
}

async function vote(message) {
    await message.channel.send(`The game has already finished!`);
}

async function joingame (message) {
    await message.channel.send(`A game is about to finish, please wait!`);
}

async function leavegame (message) {
    await message.channel.send(`The game is about to finish, please wait!`);
}