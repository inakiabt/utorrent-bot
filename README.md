# utorrent-bot
uTorrent Slack Bot

## Install
```bash
yarn install
# or npm install
```
## Build
```bash
yarn run build
# or npm run build
```
## Run
### Dev
```bash
yarn run start
# or npm run start
```
### Prod
You must build the app before
```bash
yarn run serve
# or npm run serve
```

### Environment variables
In order to setup the bot these environment variables are required:
* `UTORRENT_HOST` uTorrent WebUI's host
* `UTORRENT_PORT` uTorrent WebUI's port
* `UTORRENT_USERNAME` uTorrent WebUI's user
* `UTORRENT_PASSWORD` uTorrent WebUI's password
* `UBOT_TOKEN` Slack bot token. You can get one from https://YOUR_COMPANY.slack.com/apps/manage/custom-integrations

## Docker
### Run
```sh
docker run --rm \
  -e UBOT_TOKEN=$UBOT_TOKEN \
  -e UTORRENT_HOST=$UTORRENT_HOST \
  -e UTORRENT_PORT=$UTORRENT_PORT \
  -e UTORRENT_USERNAME=$UTORRENT_USERNAME \
  -e UTORRENT_PASSWORD=$UTORRENT_PASSWORD \
  inakiabt/utorrent-bot
```
### Docker Compose
docker-compose.yml:
```yaml
version: '2'
services:
    ubot:
        image: inakiabt/utorrent-bot
        container_name: ubot
        env_file: $HOME/.config/ubot/env
```
Where `$HOME/.config/ubot/env` is something like:
```bash
UBOT_TOKEN=YOUR_TOKEN
UTORRENT_PASSWORD=YOUR_UTORRENT_PASSWORD
UTORRENT_USERNAME=YOUR_UTORRENT_USERNAME
UTORRENT_PORT=YOUR_UTORRENT_PORT
UTORRENT_HOST=YOUR_UTORRENT_HOST
```

## Usage
*Note: whenever a "hash" argument is required, the bot will try to match the first chars of the hash*
### help
```bash
@ubot help
```
### list [status]
List of all torrents. You can filter torrents by "status"
```bash
@ubot list
@ubot list downloading
```
### add (hash)
Add torrent by url
```bash
@ubot add magnet:?xt=urn:btih...
```
### stop (hash)
Stop torrent by hash
```bash
@ubot stop 35df2
```
### start (hash)
Start torrent by hash
```bash
@ubot start 35df2
```
### remove (hash)
Remove torrent by hash
```bash
@ubot remove 35df2
```
### details (hash)
Get torrent details by hash
```bash
@ubot details 35df2
```
### files (hash)
Get torrent files by hash
```bash
@ubot files 35df2
```
