/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Send a message with attachments
* Send a message via direct message (instead of in a public channel)

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node demo_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "Attach"

  The bot will send a message with a multi-field attachment.

  Send: "dm me"

  The bot will reply with a direct message.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

import Botkit from 'botkit'
import API, { commands } from './api'
import messages from './messages'
import utorrentClient from 'library-utorrent'

if (!process.env.UBOT_TOKEN) {
  console.log('Error: Specify UBOT_TOKEN in environment');
  process.exit(1);
}

if (!process.env.UTORRENT_HOST) {
  console.log('Error: Specify UTORRENT_HOST in environment');
  process.exit(1);
}

if (!process.env.UTORRENT_PORT) {
  console.log('Error: Specify UTORRENT_PORT in environment');
  process.exit(1);
}

if (!process.env.UTORRENT_USERNAME) {
  console.log('Error: Specify UTORRENT_USERNAME in environment');
  process.exit(1);
}

if (!process.env.UTORRENT_PASSWORD) {
  console.log('Error: Specify UTORRENT_PASSWORD in environment');
  process.exit(1);
}

const api = API(utorrentClient, {
  host: process.env.UTORRENT_HOST,
  port: process.env.UTORRENT_PORT,
  username: process.env.UTORRENT_USERNAME,
  password: process.env.UTORRENT_PASSWORD
})

const controller = Botkit.slackbot({
 debug: false
});

controller.spawn({
  token: process.env.UBOT_TOKEN
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

let commandsList = {}

Object.keys(commands)
  .forEach(command => {
    commandsList[command] = command
    if (commands[command].hasOwnProperty('alias')) {
      commands[command].alias.forEach(alias => commandsList[alias] = command)
    }
  })

console.log(commandsList)
Object.keys(commandsList)
  .forEach(command => {
    controller.hears([`^${command}$`, `^${command} (.*)`], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
      api(commandsList[command], message.match[1])
        .then(result => bot.reply(message, messages(commandsList[command], result)))
        .catch(err => {
          console.error(err, '<--')
          bot.reply(message, messages('error', err))
        })
    });
  })

controller.hears(['^help$'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
  bot.reply(message, messages('help', {}))
})
