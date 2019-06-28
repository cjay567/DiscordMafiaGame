module.exports.addPlayer = function(member) {
    if (!member) {
        console.error("addPlayer called with invalid member parameter: " + member);
        return false;
    }
    
    for (let player of gamedata.currentplayers) {
        if (player.member.id === member.id) { // If player is already in game
            return false;
        }
    }

    gamedata.currentplayers.push({
        "member": member
    });

    return true;
}

module.exports.removePlayer = function(member) {
    for (let i = gamedata.currentplayers.length - 1; i >= 0; i--) {
        if (gamedata.currentplayers[i].member.id === member.id) { 
            gamedata.currentplayers.splice(i, 1);

            return true;
        }
    }

    return false;
}

module.exports.clearRoleData = function() {
    for (let i in gamedata.currentplayers.length) {
        gamedata.currentplayers[i] = { // Leaves only the member's data
            "member": gamedata.currentplayers[i]
        };
    }
}

module.exports.getPlayersWithRoles = function() { // This function accepts multiple parameters, each being a role (NOTE: WILL NOT INCLUDE DEAD PLAYERS IN RESULTS)
    let players = [];
    let roles = Array.from(arguments);
    for (let player of gamedata.currentplayers) {
        if (player.alive && roles.includes(player.role)) {
            players.push(player);
        }
    }

    return players;
}

module.exports.getPlayersWithoutRoles = function() { // This function accepts multiple parameters, each being a role (NOTE: WILL NOT INCLUDE DEAD PLAYERS IN RESULTS)
    let players = [];
    let roles = Array.from(arguments);
    for (let player of gamedata.currentplayers) {
        if (player.alive && !roles.includes(player.role)) {
            players.push(player);
        }
    }

    return players;
}

module.exports.getAlivePlayers = function() { // Gets all currently alive players
    let players = [];
    for (let player of gamedata.currentplayers) {
        if (player.alive) {
            players.push(player);
        }
    }

    return players;
}

module.exports.checkToSeeIfAllPlayersHaveVoted = function(players = gamedata.currentplayers) {
    for (let player of players) {
        if (!player.vote) {
            return false;
        }
    }

    return true;
}

module.exports.removeChannelPermissionOverwrites = function() { // Removes all permision overwrites for every channel in the game
    let promises = [];
    
    for ([snowflake, permissionOverwrite] of gamedata.townchat.permissionOverwrites) {
        if (permissionOverwrite.type === "member") {
            promises.push(permissionOverwrite.delete());
        }
    }

    for ([snowflake, permissionOverwrite] of gamedata.mafiachat.permissionOverwrites) {
        if (permissionOverwrite.type === "member") {
            promises.push(permissionOverwrite.delete());
        }
    }
    
    for ([snowflake, permissionOverwrite] of gamedata.doctorchat.permissionOverwrites) {
        if (permissionOverwrite.type === "member") {
            promises.push(permissionOverwrite.delete());
        }
    }

    for ([snowflake, permissionOverwrite] of gamedata.sheriffchat.permissionOverwrites) {
        if (permissionOverwrite.type === "member") {
            promises.push(permissionOverwrite.delete());
        }
    }

    for ([snowflake, permissionOverwrite] of gamedata.deadchat.permissionOverwrites) {
        if (permissionOverwrite.type === "member") {
            promises.push(permissionOverwrite.delete());
        }
    }

    return Promise.all(promises);
}

module.exports.closeAllChannels = function() { // Closes all channels in the game except dead-chat
    return Promise.all(
        [gamedata.townchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false}),
        gamedata.mafiachat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false}),
        gamedata.doctorchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false}),
        gamedata.sheriffchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false}),]
    );
}

module.exports.getPlayerFromMember = function(member) {
    for (let player of gamedata.currentplayers) {
        if (player.member === member) {
            return player;
        }
    }

    return false;
}

module.exports.decideVote = function(players = gamedata.currentplayers) { // Given an array of players this function will look at the votes of those players and return the majority vote, if there is one
    if (players.length === 0) {
        return false;
    }
    
    let votes = [];
    for (let player of players) {
        votes.push(player.vote);
    }
    
    let modeVote, modeVoteCount;
    let uniqueVotes = [];
    for (let vote of votes) { // Makes uniqueVotes an array full of one of every vote
        if (!uniqueVotes.includes(vote)) {
            uniqueVotes.push(vote);
        }
    }
    
    let uniqueVotesCount = [];
    for (let vote of votes) {
        let uniqueVotesId = uniqueVotes.indexOf(vote);
        if (uniqueVotesCount[uniqueVotesId] === undefined) {
            uniqueVotesCount[uniqueVotesId] = 1;
        } else {
            uniqueVotesCount[uniqueVotesId]++;
        }
    }

    let highestCount = -1;
    for (let count of uniqueVotesCount) {
        if (count > highestCount) {
            highestCount = count;
        }
    }
    // At this point highestCount contains the amount of votes of the person who was voted on the most
    if (highestCount < Math.ceil(votes.length / 2.0)) { // Check to see if it's a majority
        // Not a majority, return false
        return false;
    }

    let decidedVote = uniqueVotes[uniqueVotesCount.indexOf(highestCount)];
    if (!decidedVote || !decidedVote.member) {
        // A no-target occured
        return false;
    }
     
    return decidedVote;
}

module.exports.killPlayer = function(player) { // Does what you think it does
    player.alive = false;

    module.exports.checkIfWinConditionMet();
    
    return Promise.all([
        // When a player dies give them read access to all channels but not send access
        gamedata.townchat.updateOverwrite(player.member, {'VIEW_CHANNEL': true, 'SEND_MESSAGES': false}),
        gamedata.doctorchat.updateOverwrite(player.member, {'VIEW_CHANNEL': true, 'SEND_MESSAGES': false}),
        gamedata.mafiachat.updateOverwrite(player.member, {'VIEW_CHANNEL': true, 'SEND_MESSAGES': false}),
        gamedata.sheriffchat.updateOverwrite(player.member, {'VIEW_CHANNEL': true, 'SEND_MESSAGES': false}),

        gamedata.townchat.send(`${player.member.user} has died! They were ${getDeathRoleMessage(player.role)}`),

        gamedata.deadchat.updateOverwrite(player.member, {'VIEW_CHANNEL': true, 'SEND_MESSAGES': true})
    ]);

}

function getDeathRoleMessage(roleShort) { // Used in killPlayer
    switch(roleShort) {
        case 'V':
            return " a Villager!";
        case 'M':
            return " a member of the Mafia!";
        case 'D':
            return " the town Doctor!";
        case 'S':
            return " the town Sheriff!";
    }
}

module.exports.checkIfWinConditionMet = function() {
    let mafiaCount = module.exports.getPlayersWithRoles('M').length;
    if (mafiaCount === 0) { // All mafia dead
        // Town win
        gamedata.winner = "town";
        return;
    }

    if (mafiaCount === module.exports.getPlayersWithoutRoles('M').length) { // Mafia can no longer be lynched
        // Mafia win
        gamedata.winner = "mafia";
        return;
    }

    // if (0 === module.exports.getPlayersWithoutRoles('M').length) { // Only Mafia left
    //     // Mafia win
    //     gamedata.winner = "mafia";
    //     return;
    // }
}

module.exports.clearAllPlayerVotes = function(players = gamedata.currentplayers) {
    for (let player of players) {
        player.vote = undefined;
    }
}