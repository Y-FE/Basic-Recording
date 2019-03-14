docker save -o ars-node ars-node
scp ars-node ars-node:/data/docker/ars-node
ssh ars-node "docker stop ars-node; docker container rm ars-node; docker image rm ars-node; cd /data/docker; docker load < ars-node; docker run --name ars-node --restart always --network=host -d ars-node"