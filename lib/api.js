const plainList = response => response.map(item => item.parsed)

const list = (response, params) => plainList(response)
  .filter(item => !params.status ? true : item.status.toLowerCase() === params.status)

const details = (response, params) => plainList(response)
  .filter(item => item.hash.toLowerCase().indexOf(params.hash.toLowerCase()) === 0)

const files = (response, _) => response.files[1].map(item => ({
  fileName: item[0],
  fileSize: item[1],
  downloadedSize: item[2]
}))

const matchHash = (client, config, params) => {
  return request(client, 'details', config, params)
    .then(result => processResult('details', result, params))
    .then(result => {
      if (result.length === 0) {
        return Promise.reject(new Error('Torrent not found'))
      }
      return Promise.resolve({
        ...params,
        hash: result[0].hash
      })
    })
}

const postAction = (client, config, params, processedResult) => request(client, 'details', config, {})
    .then(result => processResult('details', result, {}))

const request = (client, command, config, processedParams) => {
  const fn = commands[command].fn
  console.log('   %s [params] -> %j', fn, processedParams)
  return new Promise((resolve, reject) => {
    client[fn](Object.assign({}, config, processedParams))
      .exec({
        error: err => reject(err),
        success: result => resolve(result)
      })
  })
}

const processResult = (command, result, params) => {
  if (!commands[command].processOutput) {
    return Promise.resolve(result)
  }

  return Promise.resolve(commands[command].processOutput(result, params))
}

const postResult = (client, config, command, params, result) => {
  if (!commands[command].hasOwnProperty('postAction')) {
    return Promise.resolve(result)
  }

  return commands[command].postAction(client, config, params, result)
}

const processInput = (client, config, command, params) => {
  if (!commands[command].processInput) {
    return Promise.resolve(params)
  }

  return commands[command].processInput(client, config, params)
}

const validateInput = (command, input) => {
  const commandConfig = commands[command]

  if (!commandConfig.hasOwnProperty('params')) {
    return Promise.resolve({})
  }

  let result = {}
  for (let param in commandConfig.params) {
    const arg = commandConfig.params[param].arg - 1
    // console.log('     validating param %s: %j -> %j', param, commandConfig.params[param], input)
    const inputValue = input[arg]
    if (commandConfig.params[param].required && !inputValue) {
      return Promise.reject(new Error('"' + param + '" is required'))
    }

    result[param] = inputValue ? inputValue.trim() : inputValue
  }

  return Promise.resolve(result)
}

export const commands = {
  list: {
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
    postAction,
    params: {
      torrentUrl: {
        description: 'Torrent url. It could be a magnet url or .torrent url',
        arg: 1,
        required: true
      }
    }
  },
  remove: {
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
    postAction,
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
    postAction,
    params: {
      hash: {
        description: 'Torrent hash',
        arg: 1,
        required: true
      }
    }
  }
}

const api = (client, config) => {
  return (command, input) => {
    const inputArr = !input ? [] : input.split(' ')
    if (!commands.hasOwnProperty(command)) {
      return Promise.reject({
        type: 'command',
        error: 'Invalid command'
      })
    }
    return validateInput(command, inputArr)
      .catch(err => {
        console.error(err)
        return Promise.reject({
          type: 'validate',
          error: err
        })
      })
      .then(validatedParams => processInput(client, config, command, validatedParams)
        .catch(err => {
          console.error(err)
          return Promise.reject({
            type: 'process',
            error: err
          })
        }))
      .then(processedParams =>
        request(client, command, config, processedParams)
          .then(result => processResult(command, result, processedParams))
          .then(result => postResult(client, config, command, processedParams, result))
          .catch(err => {
            console.error(err)
            return Promise.reject({
              type: 'api',
              error: err
            })
          }))
  }
}

export default api