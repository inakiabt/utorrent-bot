FROM node:7.7.2-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    rm -rf /var/cache/apk/*

RUN mkdir -p /opt/app
WORKDIR /opt/app

ENV UTORRENT_HOST= \
    UTORRENT_PORT= \
    UTORRENT_USERNAME= \
    UTORRENT_PASSWORD= \
    UBOT_TOKEN=

CMD ["npm", "run", "serve"]

COPY package.json /opt/app/
RUN npm install --production

COPY dist /opt/app/dist
