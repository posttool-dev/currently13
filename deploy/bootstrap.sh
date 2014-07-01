#!/bin/sh
apt-get install -y git
git clone https://github.com/posttool/currently13.git
cd currently13/
sh deploy/provision.sh
npm install

