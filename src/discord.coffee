
# Description:
#   Adapter for Hubot to communicate on Discord
#
# Commands:
#   None
#
# Configuration:
#   HUBOT_DISCORD_TOKEN - authentication token for bot
#   HUBOT_DISCORD_AUTOCONNECT - true/false to have autoReconnect enabled

try
  {Robot, Adapter, TextMessage} = require "hubot"
catch
  prequire = require "parent-require"
  {Robot, Adapter, TextMessage} = prequire "hubot"

Discord = require "discord.js"

class DiscordAdapter extends Adapter
  constructor: (robot) ->
    super robot
    @rooms = {}

  run: ->
    @token = process.env.HUBOT_DISCORD_TOKEN
    @autoConnect = process.env.HUBOT_DISCORD_AUTOCONNECT
    @activity = process.env.HUBOT_DISCORD_ACTIVITY || 'World Domination'

    if not @token?
      @robot.logger.error "Discobot Error: No token specified, please set an environment variable named HUBOT_DISCORD_TOKEN"
      return
    
    @discord = new Discord.Client autoReconnect: @autoConnect

    # after ready your bot will respond to info from discord
    @discord.on "ready", @.onready
    # the basic on message event
    @discord.on "message", @.onmessage
    # this is basically server join, TODO
    # @discord.on "guildMemberAdd", @.onguildmemberadd
    # When the bot is reconnecting
    # @discord.on "reconnecting", @.onreconnecting
    # When the bot gets disconnected from the server
    @discord.on "disconnect", @.ondisconnect

    @discord.login @token

  onready: =>
    @robot.logger.info "Discobot: Logged in as User: #{@discord.user.username}##{@discord.user.discriminator}"
    @robot.name = @discord.user.username.toLowerCase()
    robot = @robot
    
    @emit "connected"
    # post-connection actions go here
    
    # get all the rooms
    @rooms[channel.id] = channel for channel in @discord.channels
    
    # set activity
    @discord.user.setActivity(@activity, {type: 'PLAYING'})
        .then (presence) ->
          robot.logger.debug "Activity set to #{presence.game}"
          #callback null, true
        .catch (err) ->
          robot.logger.error "Error while trying to set activity"
          robot.logger.error err
          #callback err, false

  onmessage: (message) =>
    return if message.author.id == @discord.user.id
    # skip messages from the bot itself

    user = @robot.brain.userForId message.author.id

    user.name = message.author.username
    user.discriminator = message.author.discriminator
    user.room = message.channel.id

    @rooms[user.room] ?= message.channel

    text = message.content

    @robot.logger.debug "Discobot: Message (ID: #{message.id} from: #{user.name}##{user.discriminator}): #{text}"
    @robot.receive new TextMessage(user, text, message.id)
    
  # sendMessage deprecated, use send now
  # https://discord.js.org/#/docs/main/stable/class/TextChannel?scrollTo=send
  messageChannel: (channelId, message, callback) ->
    robot = @robot
    sendMessage = (channel, message, callback) ->
      callback ?= (err, success) -> {}

      channel.send(message)
        .then (msg) ->
          robot.logger.debug "SUCCESS! Send message to channel #{channel.id}"
          callback null, true
        .catch (err) ->
          robot.logger.error "Error while trying to send message #{message}"
          robot.logger.error err
          callback err, false

    @robot.logger.debug "Discobot: message: \"#{message}\" to channel: #{channelId}"

    if @rooms[channelId]? # room is already known and cached
      sendMessage @rooms[channelId], message, callback
    else # unknown room, try to find it
      channels = @discord.channels.filter (channel) -> channel.id == channelId

      if channels.first()?
        sendMessage channels.first(), message, callback
      else
        @robot.logger.error "Unknown channel id: #{channelId}"
        callback {message: "Unknown channel id: #{channelId}"}, false

  send: (envelope, messages...) ->
    for message in messages
      @messageChannel envelope.room, message

  reply: (envelope, messages...) ->
    for message in messages
      @messageChannel envelope.room, "<@#{envelope.user.id}> #{message}"

  ondisconnect: =>
    @robot.logger.info "Discobot: lost connection to the server..."

exports.use = (robot) ->
  new DiscordAdapter robot
