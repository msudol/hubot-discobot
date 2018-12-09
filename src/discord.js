/* The following code is inspired (Initially Stolen) by disbot at https://github.com/atomicptr/disbot 
That repo ha been archived by it's owner so my plan is to upgrade and improve to a more recent version 
of the discord.api and implement more discord functionality within a hub framework, I felt that disbot 
was a good starting point instead of re-inventing the wheel.
*/

let Adapter, Robot, TextMessage;
try {
    ({Robot, Adapter, TextMessage} = require("hubot"));
} catch (error) {
    const prequire = require("parent-require");
    ({Robot, Adapter, TextMessage} = prequire("hubot"));
}

const Discord = require("discord.js");


class DiscordAdapter extends Adapter {
    
    constructor(robot) {
        
        {
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.slice(thisFn.indexOf('return') + 6 + 1, thisFn.indexOf(';')).trim();
          eval(`${thisName} = this;`);
        }
        
        // onready
        this.onready = this.onready.bind(this);
        
        // onmessage
        this.onmessage = this.onmessage.bind(this);
        
        // on disconnected
        this.ondisconnected = this.ondisconnected.bind(this);
        
        super(robot);
        
        this.rooms = {};
    }

    messageChannel(channelId, message, callback) {
        const { robot } = this;
        const sendMessage = function(channel, message, callback) {
            if (callback == null) { callback = (err, success) => ({}); }

            return channel.sendMessage(message)
                .then(function(msg) {
                    robot.logger.debug(`SUCCESS! Send message to channel ${channel.id}`);
                    return callback(null, true);}).catch(function(err) {
                    robot.logger.error(`Error while trying to send message ${message}`);
                    robot.logger.error(err);
                    return callback(err, false);
            });
        };

        this.robot.logger.debug(`Discord-Hubot: Try to send message: \"${message}\" to channel: ${channelId}`);

        if (this.rooms[channelId] != null) { // room is already known and cached
            return sendMessage(this.rooms[channelId], message, callback);
        } else { // unknown room, try to find it
            const channels = this.discord.channels.filter(channel => channel.id === channelId);

            if (channels.first() != null) {
                return sendMessage(channels.first(), message, callback);
            } else {
                this.robot.logger.error(`Unknown channel id: ${channelId}`);
                return callback({message: `Unknown channel id: ${channelId}`}, false);
            }
        }
    }

    send(envelope, ...messages) {
        return Array.from(messages).map((message) =>
            this.messageChannel(envelope.room, message));
    }

    reply(envelope, ...messages) {
        return Array.from(messages).map((message) =>
            this.messageChannel(envelope.room, `<@${envelope.user.id}> ${message}`));
    }

    run() {
        this.token = process.env.Discord_TOKEN;

        if ((this.token == null)) {
            this.robot.logger.error("Discord-Hubot Error: No token specified, please set an environment variable named Discord_TOKEN");
            return;
        }

        // THIS SHOULD BE A PROCESS.ENV SETTING IN THE FUTURE
        this.discord = new Discord.Client({autoReconnect: true});

        this.discord.on("ready", this.onready);
        this.discord.on("message", this.onmessage);
        this.discord.on("disconnected", this.ondisconnected);

        return this.discord.login(this.token);
    }

    onready() {
        this.robot.logger.info(`Discord-Hubot: Logged in as User: ${this.discord.user.username}#${this.discord.user.discriminator}`);
        this.robot.name = this.discord.user.username.toLowerCase();

        return this.emit("connected");
    }

    onmessage(message) {  
        if (message.author.id === this.discord.user.id) { return; } // skip messages from the bot itself

        const user = this.robot.brain.userForId(message.author.id);

        user.name = message.author.username;
        user.discriminator = message.author.discriminator;
        user.room = message.channel.id;

        if (this.rooms[user.room] == null) { this.rooms[user.room] = message.channel; }

        const text = message.content;

        this.robot.logger.debug(`Discord-Hubot: Message (ID: ${message.id} from: ${user.name}#${user.discriminator}): ${text}`);
        return this.robot.receive(new TextMessage(user, text, message.id));
    }

    ondisconnected() {
        return this.robot.logger.info("Discord-Hubot: Bot lost connection to the server, will auto reconnect soon...");
    }
}

exports.use = function(robot) {};

new DiscordAdapter(robot);