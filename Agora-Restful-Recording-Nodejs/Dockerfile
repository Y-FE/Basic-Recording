FROM    node:alpine

RUN npm i -g node-gyp
RUN apk add --update make g++ python

# Bundle app source
COPY ./record /app/record
COPY ./server /app/server

WORKDIR /app/record

RUN ./build.sh

WORKDIR /app/server

RUN npm install

EXPOSE  82
CMD node app.js 