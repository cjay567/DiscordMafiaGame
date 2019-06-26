const playerdataUtil = require(`../util/playerdataUtil.js`);

module.exports.handler = async function(message) {

    let commands = {
        "!startmafiagame": startmafiagame, // Called in order to start a game
        "!vote": vote, // Called in order to vote to perform actions
        "!joingame": joingame, // Called when a player wants to join a game
        "!leavegame": leavegame // Called when a player wants to leave a game
    };

    if (commands[message.content]) {
        commands[message.content.split(" ")[0]](message); // Gets the word of the message
    }
}

module.exports.initializer = async function() {
    // Post message saying that it's night phase
    await gamedata.townchat.send(`It is now the beginning of night ${gamedata.currentcycle}, special roles are voting on their actions now.`);
    
    // Send messages in the respective chats about what they can do for the night
    await gamedata.mafiachat.send("Mafia member(s)! It is your goal to elimate all members of the town. Use `!vote {username}` to vote to kill a certain player. If you don't want to kill anyone then you can do `!vote none`. Remember: You cannot vote for other Mafia members and if the majority of the Mafia doesn't agree on one target, then nobody gets attacked during the night.");
    await gamedata.doctorchat.send("You are the town's doctor! The person you choose to visit at night will be healed. This means that if the Mafia attacks them, they wont be killed. You are allowed to heal yourself if you want.");

    // Open #doctor-chat and #mafia-chat
    await gamedata.mafiachat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': true}); 
    await gamedata.doctorchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': true}); 
}

async function endNight() { // Call when voting ends
    // Close #doctor-chat and #mafia-chat
    await playerdataUtil.closeAllChannels();

    // Calculate results for the night
    let healedPlayer = (playerdataUtil.getPlayersWithRoles(['D'])[0] || {}).vote; // If the doctor is dead vote will be undefined
    let attackedplayer = playerdataUtil.decideVote(playerdataUtil.getPlayersWithRoles(['M']));
    
    if (attackedplayer) { // If someone was attacked
        if (attackedplayer === healedPlayer) {
            // Post message saying they were healed
            await gamedata.townchat.send(`${attackedplayer} was attacked but they were healed by an unknown Doctor!`);
        } else {
            // Post message saying they were killed by Mafia
            await gamedata.townchat.send(`${attackedplayer} was attacked by the Mafia!`);
            // Kill them
            await playerdataUtil.killPlayer(attackedplayer);
        }
    }

    if (gamedata.winner) {
        setGameState("postgame");
    } else {
        setGameState("day");
    }
}

async function startmafiagame (message) {
    await message.channel.send(`A game has already started!`);
}

async function vote (message) {
    if (message.channel != gamedata.townchat) {
        message.channel.send("Please run this command in #town-chat.");
        return;
    }

    let memberResolvable = message.content.substr(message.content.indexOf(' ') + 1); // Cuts off all parts of the string before (inclusive) the first space character
    let votedPlayer;
    if (memberResolvable === "none" || memberResolvable === "undo") { 
        if (memberResolvable === "none") { // Player decides to vote for no action
            votedPlayer = true;
        } else { // Player decides to undo their vote
            votedPlayer = undefined;
        }

    } else {
        let votedMember = discordUtil.resolveMember(memberResolvable);
        if (!votedMember) {
            message.channel.send("I cannot find that member.");
            return;
        }

        let votedPlayer = playerdataUtil.getPlayerFromMember(votedMember);
        if (!votedPlayer) {
            message.channel.send("That player is not in the game!");
            return;
        }

        // Check to make sure Mafia didn't vote for Mafia
        if (player.role === "M" && votedPlayer.role === "M") {
            message.channel.send("You cannot vote for another member of the Mafia!");
            return;
        }

        // Check to make sure the voted player isnt dead
        if (!votedPlayer.alive) {
            message.channel.send("You cannot choose someone who is dead!");
            return;
        }
    }
   
    let player = playerdataUtil.getPlayerFromMember(message.member);
    if (!player) {
        message.channel.send("You're not in the game!");
        return;
    }

    // Check to make sure player is alive
    if (!player.alive) {
        message.channel.send("Dead players cannot vote!");
        return;
    }

    // Update player's vote
    player.vote = votedPlayer;

    // Check to see if all players that can vote have voted
    if (playerdataUtil.checkToSeeIfAllPlayersHaveVoted(playerdataUtil.getPlayersWithRoles(['M', 'D']))) { // Only check if Mafia members and the Doctor have voted
        // If they have call endNight()
        endNight();
    }
}

async function joingame (message) {
    await message.channel.send(`A game has already started!`);
}

async function leavegame (message) {
    let player = playerdataUtil.getPlayerFromMember(message.member);
    if (!player) {
        await message.channel.send(`You aren't in the game!`);
    }

    if (!player.alive) {
        await message.channel.send(`You're not alive! You can step away from the game.`);
    }

    if (message.content === "!leavegame") {
        await message.channel.send(`Are you sure? This action cannot be undone. Run \`!leavegame yes\` to leave the game.`);
    }

    if (message.content !== "!leavegame yes") {
        return;
    }

    await gamedata.townchat.send(`${message.member} has left the game!`);
    await playerdataUtil.killPlayer(message.member);
}