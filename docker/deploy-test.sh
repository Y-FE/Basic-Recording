docker save -o ars-node ars-node
scp ars-node mobile-test:/data/docker/ars-node
ssh mobile-test "docker stop ars-node; docker container rm ars-node; docker image rm ars-node; cd /data/docker; docker load < ars-node; docker run --name ars-node --network=host -e NODE_TEST=2 -d ars-node"