# hubot-discobot

A Hubot adapter for Discord, using the Discord.js API supporting the latest versions of Discord.js and Hubot. Make your own highly customizable Discord Bot.

## Information

Originally based on disbot - https://github.com/atomicptr/disbot 

Current Discord.js version: 13.3.1
Required Node.js version: >= 16.6.0

For an example of a working, complete implementation of Hubot and Hubot-discobot adapter, check out TremBot: https://github.com/Pwn9/TremBot 

See TremBot in action on the Pwn9 Discord Channel, get your server invite at http://discord.pwn9.com

### Features

* Discord.js version ^13.3.1
* More configurable hubot / discord bot instance (see ENV in setup below)
* Extend more Discord features into the adapter (The entire instance of Discord.js is extended to hubot scripts via robot.client where client = discord client)
* Must be Discord.js version 13+ due to breaking changes from Discord.js v12

## Setup

First, you should have hubot installed and understand that the purpose of the adapter (like this one) is to connect a hubot to an endpoint, whether that be IRC, Slack, Campfire, or in our case: Discord! Learn more at https://hubot.github.com/docs/

After that, setup is easy, just use NPM to install this adapter from github (and eventually from NPM):

    npm install hubot-discobot --save
    
Then run hubot with the adapter flag 

    ./bin/hubot -a discobot
    
You may also use a .json file with the env object set.

    "env": {
        "HUBOT_DISCORD_TOKEN": "your token here",
        "HUBOT_DISCORD_INTENTS": intents bitflag
        "HUBOT_DISCORD_PARTIALS": [partials array]         
        "HUBOT_DISCORD_ACTIVITY": "Super Bot Bash"
        "HUBOT_DISCORD_ACTIVITY_TYPE": "PLAYING"
    }

IMPORTANT: you need to have an environment variable called ``HUBOT_DISCORD_TOKEN`` with your Bot token which you can get here: https://discordapp.com/developers/applications/me

## Environment Variables

If environment variables are not set, they will fallback to a default, with the except of token. Without a token the bot will fail and not run.

### HUBOT_DISCORD_TOKEN

IMPORTANT: you need to have an environment variable called ``HUBOT_DISCORD_TOKEN`` with your Bot token which you can get here: https://discordapp.com/developers/applications/me

### HUBOT_DISCORD_INTENTS 

As of Discord.js v13 Intents are required to define your bots privileges: https://discordjs.guide/popular-topics/intents.html#privileged-intents

Intents is set as a bitflag, by default hubot-discobot will fallback to full intents which is 32767 - this may be unsafe and you should define your specific intents accordingly.

### HUBOT_DISCORD_PARTIALS

As of Discord.js v13 Partials are required to pull data from certain events, this comes with some benefits and drawbacks, learn more at: https://discordjs.guide/popular-topics/partials.html#partial-structures

Partials is set as an array of values, by default hubot-discobot will fallback to full partials which is ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER']

### HUBOT_DISCORD_ACTIVITY

Set the default activity that you want your bot to have.

### HUBOT_DISCORD_ACTIVITY_TYPE 

Set the default activity type.
 

## Creating scripts for your Hubot instance, with discord adpater API

You can access the discord client via robot.client. See the discord.js docs for ways to use the discord API: https://discord.js.org

### Examples

Using the environment variables for your bot, you can set a custom status. Documentation available: https://discord.js.org/#/docs/main/stable/typedef/ActivityOptions

Activity type can be one of:  PLAYING, STREAMING, LISTENING, WATCHING, COMPETING

For additional scripting examples, see the examples folder for a script in javascript that can set the bots current activity.
