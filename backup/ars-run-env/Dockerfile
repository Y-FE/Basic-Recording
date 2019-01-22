FROM phusion/baseimage:0.11

RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get install -y nodejs

COPY ./ffprobe /usr/local/bin