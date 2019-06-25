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

module.exports.getPlayersWithRoles = function() { // This function accepts multiple parameters, each being a role
    let players = [];
    let roles = Array.from(arguments);;
    for (let player of gamedata.currentplayers) {
        if (roles.includes(player.role)) {
            players.push(player);
        }
    }

    return players;
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

    return Promise.all(promises);
}

module.exports.closeAllChannels = function() { // Closes all channels in the game 
    return Promise.all(
        [gamedata.townchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false}),
        gamedata.mafiachat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false}),
        gamedata.doctorchat.updateOverwrite(gamedata.guild.defaultRole, {'SEND_MESSAGES': false})]
    );
}