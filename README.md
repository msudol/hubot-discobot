# hubot-discobot

A Hubot adapter for Discord, using the Discord.js API supporting the latest versions of Discord.js and Hubot. Make your own highly customizable Discord Bot.

## Information

Originally based on disbot - https://github.com/atomicptr/disbot 

Current Discord.js version: 12.3.1
Required Node.js version: >= 12.0.0

For an example of a working, complete implementation of Hubot and Hubot-discobot adapter, check out TremBot: https://github.com/Pwn9/TremBot 

See TremBot in action on the Pwn9 Discord Channel, get your server invite at http://discord.pwn9.com

### Features

* Discord.js version ^12.3.x
* More configurable hubot / discord bot instance (see ENV in setup below)
* Extend more Discord features into the adapter (The entire instance of Discord.js is extended to hubot scripts via robot.client where client = discord client)

More coming soon...

## Setup

First, you should have hubot installed and understand that the purpose of the adapter (like this one) is to connect a hubot to an endpoint, whether that be IRC, Slack, Campfire, or in our case: Discord! Learn more at https://hubot.github.com/docs/

After that, setup is easy, just use NPM to install this adapter from github (and eventually from NPM):

    npm install hubot-discobot
    
Then run hubot with the adapter flag 

    ./bin/hubot -a discobot
    
You may also use a .json file with the env object set.

    "env": {
        "HUBOT_DISCORD_TOKEN": "your token here",
        "HUBOT_DISCORD_ACTIVITY": "Super Bot Bash"
        "HUBOT_DISCORD_PASSWORD": "supersecret"
    }
 

Remember you need to have an environment variable called ``HUBOT_DISCORD_TOKEN`` with your Bot token which you can get here: https://discordapp.com/developers/applications/me

## Creating scripts for your Hubot instance, with discord adpater API

You can access the discord client via robot.client. See the discord.js docs for ways to use the discord API: https://discord.js.org


### Examples

See the examples folder for a script in javascript that can set the bots current activity.
