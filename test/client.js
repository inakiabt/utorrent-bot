const command = (key) => {
  return args => ({
    exec: options => {
      if (key === 'removeTorrent') {
        options.error && options.error({ command: key, error: 'ERROR', args: args })
        return
      }
      options.success && options.success({ command: key, args: args })
    }
  })
}

const commands = {
  addTorrent: command('addTorrent'),
  listTorrents: command('listTorrents'),
  addTorrentUrl: command('addTorrentUrl'),
  removeTorrent: command('removeTorrent'),
  getTorrentDetails: command('getTorrentDetails'),
  startTorrent: command('startTorrent'),
  stopTorrent: command('stopTorrent')
}

export default commands