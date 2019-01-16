docker save -o ars-node-video ars-node-video
scp ars-node-video ars:/data/docker/ars-node-video
ssh ars "docker stop ars-node-video; docker container rm ars-node-video; docker image rm ars-node-video; cd /data/docker; docker load < ars-node-video; docker run --name ars-node-video --network=host -d ars-node-video"