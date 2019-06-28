const playerdataUtil = require(`../util/playerdataUtil.js`);
const discordUtil = require(`../util/discordUtil.js`);

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
    // Message #town-chat that the game is preparing
    let startMsg = `Game is starting with: `
    for (let player of gamedata.currentplayers) {
        startMsg += `\n${player.member.user}`;
    }
    startMsg += `\nPlayers are being DMed their roles now.`;
    await gamedata.townchat.send(startMsg);

    // List the starting role setup as well so players know what roles are in the game
    let setupMsg = `The roles in play are: `
    for (let role of gamedata.currentsetup) {
        setupMsg += `${toLongRoleName(role)}, `
    }
    await gamedata.townchat.send(setupMsg);

    // Edit permissions to allow all players to see #town-chat
    let tempPromises = []; // This variable is gonna be used to store promises that are waiting to resolve
    for (let player of gamedata.currentplayers) {
        tempPromises.push(gamedata.townchat.updateOverwrite(player.member, {'VIEW_CHANNEL': true}));
    }
    await Promise.all(tempPromises);

    // Assign players their roles and DM them their roles
    // Set every player to be alive
    let roleArray = _.shuffle(gamedata.currentsetup); // Makes a shuffled clone of the setup as to not change the original
    tempPromises = [];
    for (let i in gamedata.currentplayers) {
        gamedata.currentplayers[i].role = roleArray[i];
        gamedata.currentplayers[i].alive = true;
        tempPromises.push(sendPlayerRole(gamedata.currentplayers[i])); // DMs the player their role with custom messages for each role
    }
    await Promise.all(tempPromises);

    
    // Allow the doctor to see #doctor-chat 
    tempPromises = [];
    for (let doctor of playerdataUtil.getPlayersWithRoles('D')) {
        tempPromises.push(gamedata.doctorchat.updateOverwrite(doctor.member, {'VIEW_CHANNEL': true}));
    }
    // Allow the sheriff to see #sheriff-chat 
    for (let sheriff of playerdataUtil.getPlayersWithRoles('S')) {
        tempPromises.push(gamedata.sheriffchat.updateOverwrite(sheriff.member, {'VIEW_CHANNEL': true}));
    }
    // Allow the mafia to see #mafia-chat
    for (let mafia of playerdataUtil.getPlayersWithRoles('M')) {
        tempPromises.push(gamedata.mafiachat.updateOverwrite(mafia.member, {'VIEW_CHANNEL': true}));
    }
    await Promise.all(tempPromises);

    // Edit permissions to allow all players to send messages #town-chat
    await gamedata.townchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': true}); 

    // Message #town-chat that 20 second pregame period has begun
    await gamedata.townchat.send(`Night 1 of the game will start in 20 seconds. During this time you can leave the game with !leavegame and return all players to the queue, but be warned this might anger some players.`);

    // Start timeout and set it to timeoutToStart
    await new Promise((resolve, reject) => {
        timeoutToStart = setTimeout(resolve, 20000); // Timeout for 20 seconds 
    });

    if (gamedata.currentstate !== "pregame") { // Prevents bugs
        return;
    }

    // When timeout ends move to night 
    setGameState("night");
}

let timeoutToStart; // Stores the timeout for 20 seconds that

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
        clearTimeout(timeoutToStart);
        setGameState("queue");

        playerdataUtil.removeChannelPermissionOverwrites(); // Removes all the overwrites that were added
        playerdataUtil.closeAllChannels(); // Sets send_messages for all channels to false
        
        message.channel.send(`${message.member.user} has left the game. The Game is now cancelled. The queue to join is open again. \`${gamedata.currentplayers.length}/${gamedata.currentsetup.length}\` players.`);
    } else {
        message.channel.send(`You are not in the game!`);
    }
}

function sendPlayerRole(player) { // Reminder: Make sure to not return a promise with his
    let message;
    switch (player.role) {
        case "M": // Mafia
            message = "You are a member of the Mafia! Your goal is to kill enough members of the town that they don't have a majority anymore. But be careful, the town can lynch you if they think you're suspicous." 
            break;
        case "V": // Villager
            message = "You are a Villager! Your goal is to lynch every member of the Mafia before they gain a majority." 
            break;
        case "D": // Doctor
            message = "You are the Doctor! Your goal is to lynch every member of the Mafia before they gain a majority. You also have the ability to heal a player each night so that they can't die." 
            break;
        case "S": // Sheriff
            message = "You are the Sheriff! Your goal is to lynch every member of the Mafia before they gain a majority. You're also an investigative genius. Each night you can check to see if a player is a member of the mafia." 
            break;
    }

    return discordUtil.sendDM(player.member.user, message);
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