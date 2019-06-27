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
    // Clear all votes
    playerdataUtil.clearAllPlayerVotes();

    // Post message in #town-chat saying that it's day
    gamedata.townchat.send(`Day ${gamedata.currentcycle} has begun! Use !vote to vote on who to lynch. You can use \`!vote {username}\` to vote on a person, or \`!vote none\` to vote for a no-lynch. If you wish to undo your vote, then do \`!vote undo\`.` );
    
    // Close #doctor-chat and #mafia-chat and #sheriff-chat
    await gamedata.mafiachat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false}); 
    await gamedata.doctorchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false}); 
    await gamedata.sheriffchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false}); 

    // Open #town-chat
    await gamedata.townchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': true}); 
}

async function endDay() { // Call when voting ends
    // Close #town-chat
    await gamedata.townchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false});

    // Calculate the lynch results
    // Post message in #town-chat saying what happened
    let lynchedPlayer = playerdataUtil.decideVote(playerdataUtil.getAlivePlayers()); // Makes sure that dead players don't have to vote
    if (lynchedPlayer) {
        await gamedata.townchat.send(`The town has decided to lynch ${lynchedPlayer.member.user}!`);

        playerdataUtil.killPlayer(lynchedPlayer);
    } else {
        await gamedata.townchat.send(`The town has decided to lynch nobody today.`);
    }

    // If win condition met then switch to postgame state
    // else switch to night state
    if (gamedata.winner) {
        setGameState("postgame");
    } else {
        // Increment cycle counter
        gamedata.currentcycle++;

        setGameState("night");
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

    if (message.content.indexOf(' ') === -1) { // They just typed in "!vote"
        message.channel.send("Usage: `!vote {username}`.");
        return;
    }

    let memberResolvable = message.content.substr(message.content.indexOf(' ') + 1); // Cuts off all parts of the string before (inclusive) the first space character
    let votedPlayer;
    if (memberResolvable === "none" || memberResolvable === "undo") { 
        if (memberResolvable === "none") { // Player decides to vote for no action
            votedPlayer = true;
            await message.channel.send(`You have voted for no action.`);
        } else { // Player decides to undo their vote
            votedPlayer = undefined;
            await message.channel.send(`You have undone your vote. You will need to make a decision before this phase can end.`);
        }
    } else {
        let votedMember = await discordUtil.resolveMember(memberResolvable, message.guild);
        if (!votedMember) {
            message.channel.send("I cannot find that member.");
            return;
        }

        votedPlayer = playerdataUtil.getPlayerFromMember(votedMember);
        if (!votedPlayer) {
            message.channel.send("That player is not in the game!");
            return;
        }

        // Check to make sure the voted player isnt dead
        if (!votedPlayer.alive) {
            message.channel.send("You cannot choose someone who is dead!");
            return;
        }

        await message.channel.send(`You have voted for ${votedPlayer.member.user}.`);
    }
   
    // Update player's vote
    player.vote = votedPlayer;

    // Check to see if all players have voted
    if (playerdataUtil.checkToSeeIfAllPlayersHaveVoted(playerdataUtil.getAlivePlayers())) { 
        // If they have call endDay()
        endDay();
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

    await gamedata.townchat.send(`${message.member.user} has left the game!`);
    await playerdataUtil.killPlayer(message.member);
}