#!/bin/sh
git clone https://github.com/posttool/currently13.git
cd currently13/app
npm install
forever stopall
forever start server1 toddhido