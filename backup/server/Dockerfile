FROM node-ext-builder:baseimage as build-env

# Bundle app source
COPY ./record  /app/record
WORKDIR /app/record
RUN ./build.sh

COPY ./server /app/server
WORKDIR /app/server
RUN npm install --registry=https://registry.npm.taobao.org

FROM ars-run-env:baseimage
CMD ["/sbin/my_init"]
COPY --from=build-env /app/record/AgoraRecordSdk.js /app/record/AgoraRecordSdk.js
COPY --from=build-env /app/record/agorasdk.node /app/record/agorasdk.node
COPY --from=build-env /app/record/src/sdk/bin /app/record/src/sdk/bin
COPY --from=build-env /app/record/src/sdk/libs /app/record/src/sdk/libs
COPY --from=build-env /app/server /app/server
RUN mkdir /etc/service/arsd
ADD arsd.sh /etc/service/arsd/run

# EXPOSE  9640 1080 8000 1080/udp 8000/udp 4000-4030/udp 9700/udp 25000/udp 40000-41000/udp
