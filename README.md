# hubot-discobot

A hubot adapter for the Discord.js API

## Information

Originally based on disbot - https://github.com/atomicptr/disbot 

### Changes & TODO

* Upgrade to latest version of discord.js - DONE (11.4.x)
* Create more configurable bot instance - DONE (see ENV in setup below)
* Extend more discord features into the adapter - DONE (The entire instance of discord is extended to hubot scripts via robot.client where client = discord client)

More coming soon.

## Setup

Setup is easy, just use NPM to install this adapter from github (and eventually from NPM):

    npm install https://github.com/msudol/hubot-discobot.git 
    
Then run hubot with the adapter flag 

    ./bin/hubot -a discobot
    
You may also use a .json file with the env object set.

    "env": {
        "HUBOT_DISCORD_TOKEN": "your token here",
        "HUBOT_DISCORD_AUTOCONNECT": false,
        "HUBOT_DISCORD_ACTIVITY": "Super Bot Bash"
        "HUBOT_DISCORD_PASSWORD": "supersecret"
    }
 

Remember you need to have an environment variable called ``HUBOT_DISCORD_TOKEN`` with your Bot token which you can get here: https://discordapp.com/developers/applications/me

## Creating scripts for your Hubot instance, with discord adpater API

You can access the discord client via robot.client. See the discord.js docs for ways to use the discord API: https://discord.js.org


### Examples

See the examples folder for a script in javascript that can set the bots current activity.