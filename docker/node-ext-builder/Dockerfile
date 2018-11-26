FROM node:slim
ADD sources.list  /etc/apt/sources.list
RUN apt-get update &&  apt-get install -y make  g++ python && npm i -g node-gyp --registry=https://registry.npm.taobao.org