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

module.exports.initializer = async function() {
    // Lock all chats
    await playerdataUtil.closeAllChannels();

    // Announce game has ended in #town-chat
    await gamedata.townchat.send(`The game has ended!`);

    // Declare winner from gamedata.winner in #town-chat
    switch (gamedata.winner) {
        case "town":
            await gamedata.townchat.send(`The \`Town\` has won!`);
            break;
        case "mafia":
            await gamedata.townchat.send(`The \`Mafia\` has won!`);
            break;
    }

    // List every player, their role, and whether or not theyre alive
    let playerListMessage = `The player setup:`;
    for (let player of gamedata.currentplayers) {
        playerListMessage += `\n${player.member.user} - ${toLongRoleName(player.role)} - ${player.alive ? `Alive` : `Dead`}`;
    }
    await gamedata.townchat.send(playerListMessage);

    // Open mafiachat, doctorchat, and deadchat for all players to view
    tempPromises = [];
    for (let player of gamedata.currentplayers) {
        tempPromises.push(gamedata.doctorchat.updateOverwrite(player.member, {'VIEW_CHANNEL': true}));
        tempPromises.push(gamedata.mafiachat.updateOverwrite(player.member, {'VIEW_CHANNEL': true}));
        tempPromises.push(gamedata.deadchat.updateOverwrite(player.member, {'VIEW_CHANNEL': true}));
        tempPromises.push(gamedata.sheriffchat.updateOverwrite(player.member, {'VIEW_CHANNEL': true}));
    }
    await Promise.all(tempPromises);

    // Make it so dead players can speak again in townchat
    for (let player of gamedata.currentplayers) {
        if (!player.alive) {
            tempPromises.push(gamedata.townchat.updateOverwrite(player.member, {'SEND_MESSAGES': true}));
        }
    }

    // Announce that all the chats will be closed in 40 seconds
    await gamedata.townchat.send(`Thank you for playing! The chats will be closed in 40 seconds.`);
    
    // Open #town-chat and let players talk there
    await gamedata.townchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': true}); 
    
    // Wait for 40 seconds
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 40000); // Timeout for 40 seconds
    });
    
    // Lock all chats
    await playerdataUtil.closeAllChannels();

    // Post a message in every channel saying that the previous game has ended (This is so different game's messages aren't confused with eachother)
    await gamedata.townchat.send("```PREVIOUS GAME ENDED```");
    await gamedata.mafiachat.send("```PREVIOUS GAME ENDED```");
    await gamedata.doctorchat.send("```PREVIOUS GAME ENDED```");
    await gamedata.sheriffchat.send("```PREVIOUS GAME ENDED```");
    await gamedata.deadchat.send("```PREVIOUS GAME ENDED```");

    // Remove every permission overwrite in every channel
    await playerdataUtil.removeChannelPermissionOverwrites();

    // Reset gamedata.currentplayers, gamedata.winner, gamedata.currentcycle
    gamedata.currentplayers = [];
    gamedata.winner = undefined;
    gamedata.currentcycle = 1;

    // Switch to state nogame
    setGameState("nogame");
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

function toLongRoleName(role) {
    switch(role) {
        case 'M':
            return "Mafia";
        case 'V':
            return "Villager";
        case 'D':
            return "Doctor";
        case 'S':
            return "Sheriff";
    }
}