# Description:
#   Adapter for Hubot to communicate on Discord
#
# Commands:
#   None
#
# Configuration:
#   HUBOT_DISCORD_TOKEN - authentication token for bot
#   HUBOT_DISCORD_ACTIVITY - Status message to set for current activity
#   HUBOT_DISCORD_ACTIVITY_TYPE - One of PLAYING,STREAMING,LISTENING,WATCHING,COMPETING

try
  {Robot, Adapter, TextMessage} = require "hubot"
catch
  prequire = require "parent-require"
  {Robot, Adapter, TextMessage} = prequire "hubot"

# load discord.js
Discord = require "discord.js"
# invoke the intents structure
Intents = Discord.Intents

class DiscordAdapter extends Adapter
  constructor: (robot) ->
    super robot
    @rooms = {}

  run: ->
    # get all process.envs if set or use default
    @token = process.env.HUBOT_DISCORD_TOKEN
    @activity = process.env.HUBOT_DISCORD_ACTIVITY || 'World Domination'
    @activityType = process.env.HUBOT_DISCORD_ACTIVITY_TYPE || 'PLAYING'
    @intents = process.env.HUBOT_DISCORD_INTENTS || 32767
    @partials = process.env.HUBOT_DISCORD_PARTIALS || ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER']

    if not @token?
      @robot.logger.error "Discobot: No token specified, please set an environment variable named HUBOT_DISCORD_TOKEN"
      return
    
    @robot.logger
    
    myIntents = new Intents(@intents)

    #invoke new client with intents and partials
    @discord = new Discord.Client({ intents: myIntents, partials: @partials })

    # Extend discord.js API to hubot scripts
    @robot.client = @discord
    
    ## EVENTS

    # after ready your bot will respond to info from discord
    @discord.on "ready", @.onready
    # interaction - new in discord.js v13 - this represents a slash / command
    @discord.on "interactionCreate", @.oninteraction
    # the basic on message event
    @discord.on "messageCreate", @.onmessage
    # When the bot is reconnecting
    @discord.on "reconnecting", @.onreconnecting
    # When the bot gets disconnected from the server
    @discord.on "disconnect", @.ondisconnect
    # Emitted whenever the client's WebSocket encounters a connection error.
    @discord.on "error", @.onerror
    # Emitted for general debugging information.
    @discord.on "debug", @.ondebug
    # Emitted for general warnings.
    @discord.on "warn", @.onwarn

    # login client with token - good luck!
    @discord.login @token

  oninteraction: (interaction)  =>
    @robot.logger.info "Discobot: Interaction received"
 
  onready: =>
    @robot.logger.info "Discobot: Logged in as: #{@discord.user.username}##{@discord.user.discriminator}"
    @robot.name = @discord.user.username.toLowerCase()
    robot = @robot
    
    @emit "connected"
    # post-connection actions go here
    
    # get all the rooms
    @rooms = @discord.channels.cache
    
    # set activity
    # types: PLAYING,STREAMING,LISTENING,WATCHING,COMPETING - https://discord.js.org/#/docs/main/stable/typedef/ActivityType
    robot.client.user.setActivity(@activity, {type: @activityType})

  onmessage: (message) =>
    return if message.author.id == @discord.user.id
    # skip messages from the bot itself

    user = @robot.brain.userForId message.author.id

    user.name = message.author.username
    user.discriminator = message.author.discriminator
    user.room = message.channel.id

    @rooms[user.room] ?= message.channel

    #Use clean content so <@&{id}> looks like @robot-name for replying purposes
    text = message.cleanContent ? message.content

    #If in private, pretend the robot name is part of the text for replying purposes
    if (message.channel instanceof Discord.DMChannel)
      text = "#{@robot.name}: #{text}"

    @robot.logger.debug "Discobot: Message (ID: #{message.id} from: #{user.name}##{user.discriminator}): #{text}"
    @robot.receive new TextMessage(user, text, message.id)

  # send a message to a channel    
  messageChannel: (channelId, message, callback) ->
    robot = @robot
    # declare sendmessage function to channel type: channel, and message type: message object
    sendMessage = (channel, message, callback) ->
      callback ?= (err, success) -> {}
      # discord.js.org/#/docs/main/stable/class/TextChannel?scrollTo=send
      channel.send(message)
        .then (msg) ->
          callback null, true
        .catch (err) ->
          robot.logger.error "Discobot: Error while trying to send: #{message}"
          robot.logger.error err
          callback err, false

    @robot.logger.debug "Discobot: \"#{message}\" to channel: #{channelId}"

    if @rooms[channelId]? # room is already known and cached
      sendMessage @rooms[channelId], message, callback  
    else # unknown room - try to find and send
      @discord.channels.fetch(channelId).then((channel) ->
        sendMessage channel, message, callback
      ).catch console.error 

  send: (envelope, messages...) ->
    for message in messages
      @messageChannel envelope.room, message

  reply: (envelope, messages...) ->
    for message in messages
      @messageChannel envelope.room, "<@#{envelope.user.id}> #{message}"

  ondisconnect: (event) =>
    @robot.logger.info "Discobot: Lost connection to the server..."
    
  onreconnecting: =>
    @robot.logger.info "Discobot: Attempting to reconnect to server..."
    
  onerror: (err) =>
    @robot.logger.error err
    
  ondebug: (message) =>
    @robot.logger.debug message

  onwarn: (message) =>
    @robot.logger.info message

exports.use = (robot) ->
  new DiscordAdapter robot
