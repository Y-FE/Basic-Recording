# 说明

## build

node-ext-builder 目录下的 Dockerfile 用来生成编译 node-ext 的 docker image，执行相应的 build.sh 即可。
ars-run-env 目录下的 Dockerfile 用来生成最终的运行环境 docker image，执行相应的 build.sh 即可。

以上两部完成后执行本目录下的 build.sh 即可生成最终的 image。

## 运行

直接部署运行参考 deploy-test.sh
在阿里云容器服务运行，使用 push-prod.sh 即可。
