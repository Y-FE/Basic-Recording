FROM node-ext-builder as build-env

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
EXPOSE  3000
CMD node server/app.js
