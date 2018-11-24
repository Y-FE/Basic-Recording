FROM node:slim as build-env
ADD sources.list  /etc/apt/sources.list
RUN apt-get update &&  apt-get install -y make  g++ python && npm i -g node-gyp --registry=https://registry.npm.taobao.org

# Bundle app source
COPY ./record  /app/record
WORKDIR /app/record
RUN ./build.sh

COPY ./server /app/server
WORKDIR /app/server
RUN npm install

WORKDIR /app
FROM node:slim
COPY --from=build-env /app/record/AgoraRecordSdk.js ./record/AgoraRecordSdk.js
COPY --from=build-env /app/record/agorasdk.node ./record/agorasdk.node
COPY --from=build-env /app/server ./server
EXPOSE  82
CMD node server/app.js
