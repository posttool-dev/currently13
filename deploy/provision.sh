#!/bin/sh
apt-get update
# tools
apt-get install -y htop
# build essentials, python
apt-get install -y build-essential --no-install-recommends
apt-get install -y python-software-properties
# redis
apt-get install -y redis-server --no-install-recommends
# add repository info for mongodb, node, graphicsmagick
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
add-apt-repository -y ppa:chris-lea/node.js
add-apt-repository -y ppa:dhor/myway
# install
apt-get update
apt-get install -y graphicsmagick
apt-get install -y mongodb-org
apt-get install -y nodejs
npm install -g forever
# env
DIR="$( cd "$( dirname "$0" )" && pwd )"
cp $DIR/provision/nodejs.sh /etc/profile.d/nodejs.sh
