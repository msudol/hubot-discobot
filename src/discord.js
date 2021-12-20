// Description:
//   Adapter for Hubot to communicate on Discord
//
// Commands:
//   None
//
// Configuration:
//   HUBOT_DISCORD_TOKEN - authentication token for bot
//   HUBOT_DISCORD_ACTIVITY - Status message to set for current activity
//   HUBOT_DISCORD_ACTIVITY_TYPE - One of PLAYING,STREAMING,LISTENING,WATCHING,COMPETING

let Adapter, Robot, TextMessage;

try {
  ({Robot, Adapter, TextMessage} = require("hubot"));
} catch (error) {
  const prequire = require("parent-require");
  ({Robot, Adapter, TextMessage} = prequire("hubot"));
}

const { Discord, Intents } = require('discord.js');

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES);

class DiscordAdapter extends Adapter {
  constructor(robot) {
    super(robot);
    this.onready = this.onready.bind(this);
    this.onmessage = this.onmessage.bind(this);
    this.ondisconnect = this.ondisconnect.bind(this);
    this.onreconnecting = this.onreconnecting.bind(this);
    this.onerror = this.onerror.bind(this);
    this.ondebug = this.ondebug.bind(this);
    this.onwarn = this.onwarn.bind(this);
    this.rooms = {};
  }

  run() {
    this.token = process.env.HUBOT_DISCORD_TOKEN;
    this.activity = process.env.HUBOT_DISCORD_ACTIVITY || 'World Domination';
    this.activityType = process.env.HUBOT_DISCORD_ACTIVITY_TYPE || 'PLAYING';

    if ((this.token == null)) {
      this.robot.logger.error("Discobot: No token specified, please set an environment variable named HUBOT_DISCORD_TOKEN");
      return;
    }
    
    this.robot.logger;
    
    this.discord = new Discord.Client({ intents: myIntents });

    // Extend discord.js API to hubot scripts
    this.robot.client = this.discord;
    
    // after ready your bot will respond to info from discord
    this.discord.on("ready", this.onready);
    // the basic on message event
    this.discord.on("message", this.onmessage);
    // When the bot is reconnecting
    this.discord.on("reconnecting", this.onreconnecting);
    // When the bot gets disconnected from the server
    this.discord.on("disconnect", this.ondisconnect);
    // Emitted whenever the client's WebSocket encounters a connection error.
    this.discord.on("error", this.onerror);
    // Emitted for general debugging information.
    this.discord.on("debug", this.ondebug);
    // Emitted for general warnings.
    this.discord.on("warn", this.onwarn);

    return this.discord.login(this.token);
  }

  onready() {
    this.robot.logger.info(`Discobot: Logged in as: ${this.discord.user.username}#${this.discord.user.discriminator}`);
    this.robot.name = this.discord.user.username.toLowerCase();
    const {
      robot
    } = this;
    
    this.emit("connected");
    // post-connection actions go here
    
    // get all the rooms
    this.rooms = this.discord.channels.cache;
    
    // set activity
    // types: PLAYING,STREAMING,LISTENING,WATCHING,COMPETING - https://discord.js.org/#/docs/main/stable/typedef/ActivityType
    return this.discord.user.setActivity(this.activity, {type: this.activityType})
        .then(presence => robot.logger.info(`Discobot: Activity set to ${presence.activities.toString()}`)).catch(function(err) {
          robot.logger.error("Discobot: Error while trying to set activity");
          return robot.logger.error(err);
    });
  }

  onmessage(message) {
    if (message.author.id === this.discord.user.id) { return; }
    // skip messages from the bot itself

    const user = this.robot.brain.userForId(message.author.id);

    user.name = message.author.username;
    user.discriminator = message.author.discriminator;
    user.room = message.channel.id;

    if (this.rooms[user.room] == null) { this.rooms[user.room] = message.channel; }

    const text = message.content;

    this.robot.logger.debug(`Discobot: Message (ID: ${message.id} from: ${user.name}#${user.discriminator}): ${text}`);
    return this.robot.receive(new TextMessage(user, text, message.id));
  }

  // send a message to a channel    
  messageChannel(channelId, message, callback) {
    const {
      robot
    } = this;
    // declare sendmessage function to channel type: channel, and message type: message object
    const sendMessage = function(channel, message, callback) {
      if (callback == null) { callback = (err, success) => ({}); }
      // discord.js.org/#/docs/main/stable/class/TextChannel?scrollTo=send
      return channel.send(message)
        .then(msg => callback(null, true)).catch(function(err) {
          robot.logger.error(`Discobot: Error while trying to send: ${message}`);
          robot.logger.error(err);
          return callback(err, false);
      });
    };

    this.robot.logger.debug(`Discobot: \"${message}\" to channel: ${channelId}`);

    if (this.rooms[channelId] != null) { // room is already known and cached
      return sendMessage(this.rooms[channelId], message, callback);  
    } else { // unknown room - try to find and send
      return this.discord.channels.fetch(channelId).then(channel => sendMessage(channel, message, callback)).catch(console.error); 
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

  ondisconnect(event) {
    return this.robot.logger.info("Discobot: Lost connection to the server...");
  }
    
  onreconnecting() {
    return this.robot.logger.info("Discobot: Attempting to reconnect to server...");
  }
    
  onerror(err) {
    return this.robot.logger.error(err);
  }
    
  ondebug(message) {
    return this.robot.logger.debug(message);
  }

  onwarn(message) {
    return this.robot.logger.info(message);
  }
}

exports.use = robot => new DiscordAdapter(robot);


/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */