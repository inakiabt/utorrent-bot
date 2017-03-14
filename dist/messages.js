'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _api = require('./api');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var details = function details(result) {
  if (result.length === 0) {
    return noResults;
  }

  var item = result[0];
  var eta = (0, _moment2.default)().add(item.etaSec, 'seconds');

  return {
    "attachments": [{
      "color": item.percentProgressMils === 1000 ? "good" : "#439FE0",
      // "pretext": "Torrents list",
      "title": item.name,
      "text": ':slack: ' + item.hash.toLowerCase(),
      "fields": [{
        "title": "Status",
        "value": item.status + ' (' + progress(item) + '%)',
        "short": true
      }, {
        "title": "Size",
        "value": humanFileSize(item.size),
        "short": true
      }, {
        "title": "Downloaded",
        "value": humanFileSize(item.downloadedBytes),
        "short": true
      }, {
        "title": "Uploaded",
        "value": humanFileSize(item.uploadedBytes),
        "short": true
      }, {
        "title": "Seeds",
        "value": item.seedsConnected + ' / ' + item.seedsSwarm,
        "short": true
      }, {
        "title": "Peers",
        "value": item.peersConnected + ' / ' + item.peersSwarm,
        "short": true
      }, {
        "title": "ETA",
        "value": '' + (item.etaSec > 0 ? (0, _moment2.default)().to(eta) : '--'),
        "short": true
      }]
    }]
  };
};

function humanFileSize(bytes) {
  var si = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  var thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

var progress = function progress(item) {
  return Math.round(item.percentProgressMils / 10, 2);
};
var torrent = function torrent(item) {
  return progress(item) + '% *' + item.name + '*\n\t:slack: ' + item.hash;
};
var statusColor = function statusColor(status) {
  switch (status.toLowerCase()) {
    case 'stopped':
      return 'danger';
    case 'finished':
      return 'good';
    case 'queued':
      return 'warning';
    case 'downloading':
      return '#439FE0';
    default:
      return 'warning';
  }
};
var noResults = 'mmm :thinking_face: no results';
var list = function list(result) {
  if (result.length === 0) {
    return noResults;
  }

  return {
    "attachments": result.map(function (item) {
      return {
        "fallback": "Torrents list:",
        "color": statusColor(item.status),
        "author_name": item.status + ' (' + progress(item) + '%)',
        "title": item.name,
        "text": ':slack: ' + item.hash.toLowerCase().substring(0, 8)
      };
    }).slice(0, 50)
  };
};

var showParams = function showParams(params) {
  return Object.keys(params).map(function (param) {
    return !params[param].required ? '[' + param + ']' : param;
  }).join(' ');
};

var paramsDescription = function paramsDescription(params) {
  return Object.keys(params).map(function (param) {
    return '       _' + param + ': ' + params[param].description + '_';
  }).join('\n');
};

var showAliases = function showAliases(aliases) {
  return '\n    Alias: ' + aliases.map(function (alias) {
    return '*' + alias + '*';
  }).join(', ');
};

var help = function help(_) {
  return Object.keys(_api.commands).map(function (command) {
    return '*' + command + '* ' + showParams(_api.commands[command].params) + '\n    _' + _api.commands[command].description + '_' + (_api.commands[command].hasOwnProperty('alias') ? showAliases(_api.commands[command].alias) : '') + '\n    Arguments:\n' + paramsDescription(_api.commands[command].params) + '\n';
  }).join('\n');
};

var error = function error(err) {
  return {
    "attachments": [{
      "fallback": "Error!",
      "color": "danger",
      // "author_name": ":fire::fire::fire::fire::fire::fire::fire::fire:",
      "title": ':fire: ' + err.error.message + ' :fire:',
      "text": err.type !== 'api' ? "Run \"help\" to get more info" : ''
    }]
  };
};

var files = function files(result) {
  return {
    "attachments": result.map(function (item) {
      return {
        "fallback": "Torrent files:",
        "color": statusColor(item.fileSize > item.downloadedSize ? 'downloading' : 'finished'),
        "author_name": item.fileName,
        // "text": `:slack: ${item.hash.toLowerCase().substring(0, 8)}`
        "fields": [{
          "title": "Size",
          "value": humanFileSize(item.fileSize),
          "short": true
        }, {
          "title": "Downloaded",
          "value": humanFileSize(item.downloadedSize),
          "short": true
        }]
      };
    }).slice(0, 50)
  };
};

var helpMessage = help();

var commandsMap = {
  error: error,
  list: list,
  files: files,
  details: details,
  start: list,
  stop: list,
  help: function help(_) {
    return helpMessage;
  }
};
var messages = function messages(command, result) {
  if (!commandsMap.hasOwnProperty(command)) {
    return 'Done :white_check_mark:';
  }
  return commandsMap[command](result);
};

exports.default = messages;