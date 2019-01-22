FROM phusion/baseimage:0.11
# ADD sources.list  /etc/apt/sources.list
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get update &&  apt-get install -y make  g++ python nodejs && npm i -g node-gyp --registry=https://registry.npm.taobao.org
