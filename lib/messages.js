import { commands } from './api'
import moment from 'moment'

const details = result => {
  if (result.length === 0) {
    return noResults
  }

  const item = result[0]
  const eta = moment().add(item.etaSec, 'seconds')

  return {
    "attachments": [
        {
            "color": item.percentProgressMils === 1000 ? "good" : "#439FE0",
            // "pretext": "Torrents list",
            "title": item.name,
            "text": `:slack: ${item.hash.toLowerCase()}`,
            "fields": [
                {
                    "title": "Status",
                    "value": `${item.status} (${progress(item)}%)`,
                    "short": true
                },
                {
                    "title": "Size",
                    "value": humanFileSize(item.size),
                    "short": true
                },
                {
                    "title": "Downloaded",
                    "value": humanFileSize(item.downloadedBytes),
                    "short": true
                },
                {
                    "title": "Uploaded",
                    "value": humanFileSize(item.uploadedBytes),
                    "short": true
                },
                {
                    "title": "Seeds",
                    "value": `${item.seedsConnected} / ${item.seedsSwarm}`,
                    "short": true
                },
                {
                    "title": "Peers",
                    "value": `${item.peersConnected} / ${item.peersSwarm}`,
                    "short": true
                },
                {
                    "title": "ETA",
                    "value": `${item.etaSec > 0 ? moment().to(eta) : '--'}`,
                    "short": true
                }
            ]
        }
    ]
  }
}

function humanFileSize(bytes, si = true) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

const progress = item => Math.round(item.percentProgressMils / 10, 2)
const torrent = (item) => `${progress(item)}% *${item.name}*\n\t:slack: ${item.hash}`
const statusColor = status => {
  switch(status.toLowerCase()) {
    case 'stopped':
      return 'danger'
    case 'finished':
      return 'good'
    case 'queued':
      return 'warning'
    case 'downloading':
      return '#439FE0'
    default:
      return 'warning'
  }
}
const noResults = 'mmm :thinking_face: no results'
const list = (result) => {
  if (result.length === 0) {
    return noResults
  }

  return {
    "attachments": result.map(item => ({
      "fallback": "Torrents list:",
      "color": statusColor(item.status),
      "author_name": `${item.status} (${progress(item)}%)`,
      "title": item.name,
      "text": `:slack: ${item.hash.toLowerCase().substring(0, 8)}`
    })).slice(0, 50)
  }
}

const showParams = params => Object.keys(params)
  .map(param => !params[param].required ? `[${param}]` : param)
  .join(' ')

const paramsDescription = params => Object.keys(params)
  .map(param => `       _${param}: ${params[param].description}_`)
  .join('\n')

const help = _ => Object.keys(commands)
  .map(command => `*${command}* ${showParams(commands[command].params)}
    _${commands[command].description}_
    Arguments:\n${paramsDescription(commands[command].params)}\n`)
  .join('\n')

const error = err => ({
  "attachments": [{
    "fallback": "Error!",
    "color": "danger",
    // "author_name": ":fire::fire::fire::fire::fire::fire::fire::fire:",
    "title": `:fire: ${err.error.message} :fire:`,
    "text": err.type !== 'api' ? "Run \"help\" to get more info" : '',
    // "fields": [
    //   {
    //       "title": "Type",
    //       "value": err.type,
    //       "short": true
    //   }
    // ]
  }]
})

const files = result => ({
  "attachments": result.map(item => ({
    "fallback": "Torrent files:",
    "color": statusColor(item.fileSize > item.downloadedSize ? 'downloading' : 'finished'),
    "author_name": item.fileName,
    // "text": `:slack: ${item.hash.toLowerCase().substring(0, 8)}`
    "fields": [
        {
            "title": "Size",
            "value": humanFileSize(item.fileSize),
            "short": true
        },
        {
            "title": "Downloaded",
            "value": humanFileSize(item.downloadedSize),
            "short": true
        }
    ]
  })).slice(0, 50)
})

const commandsMap = {
  error,
  list,
  files,
  details,
  start: list,
  stop: list,
  help
}
const messages = (command, result) => {
  if (!commandsMap.hasOwnProperty(command)) {
    return 'Done :white_check_mark:'
  }
  return commandsMap[command](result)
}

export default messages
