# DiscordMafia
A bot for Discord Hack Week that lets you play the classic party game, Mafia, on your very own Discord Server!

## Commands
- !startmafiagame: Start a new game of Mafia.

- !joingame: Join an existing game.

- !vote: Vote (or target) another player.

- !leavegame: Leave a game that's currently running.


## Roles
- Villager:
    - Wins if there are no mafia remaining.
    - Sided with the village.

- Doctor:
    - Can choose one person to save every night.
    - Sided with the village.

- Mafia:
    - Chooses one person to kill every night.
    - Wins when the mafia outnumber the village.
    - Sided with the mafia.

- Sheriff:
    - Visits one person every night.
    - Receives a report with that person's alignment.
    - Sided with the village.
    
---

## Setup
Once you've downloaded the repo, you'll need a client ID and a guild (server) ID to run this bot on your own server (Ensure you have Developer Mode turned on in your settings!)
These are required for the [token.js](https://github.com/tjpc3/DiscordMafiaGame/blob/master/config/token.js) file in the config folder.

You also would need the latest version of [node.js](https://nodejs.org/en/) installed.
 
### Steps to get your guild ID
1. Ensure you have developer mode turned ON.

2. You must be in a server where you have privileges to add bots. If you don't, create one.

3. Right click the name of the server you'll be using and select "Copy ID"

4. Copy your ID to the [config/token.js](https://github.com/tjpc3/DiscordMafiaGame/blob/master/config/token.js)
 file and save.
 
### Steps to get your client ID, and adding your bot to the server
1. Follow the guide to [set up a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html) on the [Discord Developer Portal](https://discordapp.com/developers).

2. Copy your token from the Bot tab on your application to the [config/token.js](https://github.com/tjpc3/DiscordMafiaGame/blob/master/config/token.js)
 file and save.

3. Use this link ```https://discordapp.com/oauth2/authorize?client_id=CLIENT-ID-HERE8&scope=bot```, replacing CLIENT-ID-HERE with your bot's client ID, and copy/paste it in your browser. You'll arrive at a page similar to this:

![](https://discordjs.guide/assets/img/A8l70bj.3d267a22.png)

4. Select your server from the dropdown menu and click "Authorize".

And that's it! To start the bot, navigate in your terminal to the location where you downloaded the repo and type "run".

