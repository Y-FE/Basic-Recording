docker save -o ars-node-video ars-node-video
scp ars-node-video mobile-test:/data/docker/ars-node-video
ssh mobile-test "docker stop ars-node-video; docker container rm ars-node-video; docker image rm ars-node-video; cd /data/docker; docker load < ars-node-video; docker run --name ars-node-video --network=host -e NODE_TEST=2 -d ars-node-video"