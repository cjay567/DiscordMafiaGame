module.exports.addPlayer = function(member) {
    for (player in gamedata.currentplayers) {
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
    for (let i = gamedata.currentplayers.length; i >= 0; i--) {
        if (gamedata.currentplayers[i].member.id === member.id) { 
            gamedata.currentplayers.splice(i, 1);

            return true;
        }
    }

    return false;
}

module.exports.clearRoleData = function() {
    for (let i = 0; i < gamedata.currentplayers.length; i++) {
        gamedata.currentplayers[i] = { // Leaves only the member's data
            "member": gamedata.currentplayers[i]
        };
    }
}

module.exports.getPlayersWithRoles = function() { // This function accepts multiple parameters, each being a role
    let players = [];
    for (player in gamedata.currentplayers) {
        if (arguments.contains(player.role)) {
            players.push(player);
        }
    }
    
    return players;
}