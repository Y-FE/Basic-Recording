FROM node-ext-builder as build-env

# Bundle app source
COPY ./record  /app/record
WORKDIR /app/record
RUN ./build.sh

COPY ./server /app/server
WORKDIR /app/server
RUN npm install

FROM node:slim
COPY --from=build-env /app/record/AgoraRecordSdk.js /app/record/AgoraRecordSdk.js
COPY --from=build-env /app/record/agorasdk.node /app/record/agorasdk.node
COPY --from=build-env /app/record/src/sdk/bin /app/record/src/sdk/bin
COPY --from=build-env /app/record/src/sdk/libs /app/record/src/sdk/libs
COPY --from=build-env /app/server /app/server
WORKDIR /app
EXPOSE  9640 1080 8000 1080/udp 8000/udp 4000-4030/udp 9700/udp 25000/udp 40000-41000/udp
CMD node server/app.js
