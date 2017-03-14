'use strict';

var _botkit = require('botkit');

var _botkit2 = _interopRequireDefault(_botkit);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _messages = require('./messages');

var _messages2 = _interopRequireDefault(_messages);

var _libraryUtorrent = require('library-utorrent');

var _libraryUtorrent2 = _interopRequireDefault(_libraryUtorrent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var api = (0, _api2.default)(_libraryUtorrent2.default, {
  host: process.env.UTORRENT_HOST,
  port: process.env.UTORRENT_PORT,
  username: process.env.UTORRENT_USERNAME,
  password: process.env.UTORRENT_PASSWORD
});

var controller = _botkit2.default.slackbot({
  debug: false
});

controller.spawn({
  token: process.env.UBOT_TOKEN
}).startRTM(function (err) {
  if (err) {
    throw new Error(err);
  }
});

var commandsList = {};

Object.keys(_api.commands).forEach(function (command) {
  commandsList[command] = command;
  if (_api.commands[command].hasOwnProperty('alias')) {
    _api.commands[command].alias.forEach(function (alias) {
      return commandsList[alias] = command;
    });
  }
});

console.log(commandsList);
Object.keys(commandsList).forEach(function (command) {
  controller.hears(['^' + command + '$', '^' + command + ' (.*)'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    api(commandsList[command], message.match[1]).then(function (result) {
      return bot.reply(message, (0, _messages2.default)(commandsList[command], result));
    }).catch(function (err) {
      console.error(err, '<--');
      bot.reply(message, (0, _messages2.default)('error', err));
    });
  });
});

controller.hears(['^help$'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  bot.reply(message, (0, _messages2.default)('help', {}));
});