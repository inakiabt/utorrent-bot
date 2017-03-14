'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var plainList = function plainList(response) {
  return response.map(function (item) {
    return item.parsed;
  });
};

var list = function list(response, params) {
  return plainList(response).filter(function (item) {
    return !params.status ? true : item.status.toLowerCase() === params.status;
  });
};

var details = function details(response, params) {
  return plainList(response).filter(function (item) {
    return item.hash.toLowerCase().indexOf(params.hash.toLowerCase()) === 0;
  });
};

var files = function files(response, _) {
  return response.files[1].map(function (item) {
    return {
      fileName: item[0],
      fileSize: item[1],
      downloadedSize: item[2]
    };
  });
};

var matchHash = function matchHash(client, config, params) {
  return request(client, 'details', config, params).then(function (result) {
    return processResult('details', result, params);
  }).then(function (result) {
    if (result.length === 0) {
      return Promise.reject(new Error('Torrent not found'));
    }
    return Promise.resolve(_extends({}, params, {
      hash: result[0].hash
    }));
  });
};

var postAction = function postAction(client, config, params, processedResult) {
  return request(client, 'details', config, {}).then(function (result) {
    return processResult('details', result, {});
  });
};

var request = function request(client, command, config, processedParams) {
  var fn = commands[command].fn;
  console.log('   %s [params] -> %j', fn, processedParams);
  return new Promise(function (resolve, reject) {
    client[fn](Object.assign({}, config, processedParams)).exec({
      error: function error(err) {
        return reject(err);
      },
      success: function success(result) {
        return resolve(result);
      }
    });
  });
};

var processResult = function processResult(command, result, params) {
  if (!commands[command].processOutput) {
    return Promise.resolve(result);
  }

  return Promise.resolve(commands[command].processOutput(result, params));
};

var postResult = function postResult(client, config, command, params, result) {
  if (!commands[command].hasOwnProperty('postAction')) {
    return Promise.resolve(result);
  }

  return commands[command].postAction(client, config, params, result);
};

var processInput = function processInput(client, config, command, params) {
  if (!commands[command].processInput) {
    return Promise.resolve(params);
  }

  return commands[command].processInput(client, config, params);
};

var validateInput = function validateInput(command, input) {
  var commandConfig = commands[command];

  if (!commandConfig.hasOwnProperty('params')) {
    return Promise.resolve({});
  }

  var result = {};
  for (var param in commandConfig.params) {
    var arg = commandConfig.params[param].arg - 1;
    // console.log('     validating param %s: %j -> %j', param, commandConfig.params[param], input)
    var inputValue = input[arg];
    if (commandConfig.params[param].required && !inputValue) {
      return Promise.reject(new Error('"' + param + '" is required'));
    }

    result[param] = inputValue ? inputValue.trim() : inputValue;
  }

  return Promise.resolve(result);
};

var commands = exports.commands = {
  list: {
    alias: ['ls'],
    description: 'List of all torrents',
    fn: 'listTorrents',
    processOutput: list,
    params: {
      status: {
        description: 'Torrent status: paused, stopped, started, finished, downloading',
        arg: 1
      }
    }
  },
  add: {
    description: 'Add torrent by url',
    fn: 'addTorrentUrl',
    postAction: postAction,
    params: {
      torrentUrl: {
        description: 'Torrent url. It could be a magnet url or .torrent url',
        arg: 1,
        required: true
      }
    }
  },
  remove: {
    alias: ['rm'],
    description: 'Remove torrent by hash',
    fn: 'removeTorrent',
    processInput: matchHash,
    params: {
      hash: {
        description: 'Torrent hash',
        arg: 1,
        required: true
      }
    }
  },
  details: {
    alias: ['d'],
    description: 'Get torrent details by hash',
    processOutput: details,
    fn: 'listTorrents',
    params: {
      hash: {
        description: 'Torrent hash',
        arg: 1,
        required: true
      }
    }
  },
  files: {
    description: 'Get torrent files by hash',
    processOutput: files,
    processInput: matchHash,
    fn: 'getTorrentDetails',
    params: {
      hash: {
        description: 'Torrent hash',
        arg: 1,
        required: true
      }
    }
  },
  start: {
    description: 'Start torrent by hash',
    processInput: matchHash,
    fn: 'startTorrent',
    postAction: postAction,
    params: {
      hash: {
        description: 'Torrent hash',
        arg: 1,
        required: true
      }
    }
  },
  stop: {
    description: 'Stop torrent by hash',
    processInput: matchHash,
    fn: 'stopTorrent',
    postAction: postAction,
    params: {
      hash: {
        description: 'Torrent hash',
        arg: 1,
        required: true
      }
    }
  }
};

var api = function api(client, config) {
  return function (command, input) {
    var inputArr = !input ? [] : input.split(' ');
    if (!commands.hasOwnProperty(command)) {
      return Promise.reject({
        type: 'command',
        error: 'Invalid command'
      });
    }
    return validateInput(command, inputArr).catch(function (err) {
      console.error(err);
      return Promise.reject({
        type: 'validate',
        error: err
      });
    }).then(function (validatedParams) {
      return processInput(client, config, command, validatedParams).catch(function (err) {
        console.error(err);
        return Promise.reject({
          type: 'process',
          error: err
        });
      });
    }).then(function (processedParams) {
      return request(client, command, config, processedParams).then(function (result) {
        return processResult(command, result, processedParams);
      }).then(function (result) {
        return postResult(client, config, command, processedParams, result);
      }).catch(function (err) {
        console.error(err);
        return Promise.reject({
          type: 'api',
          error: err
        });
      });
    });
  };
};

exports.default = api;