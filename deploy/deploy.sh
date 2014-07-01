#!/bin/sh
git pull origin master
cd app
npm install
forever stopall
forever start server1.js toddhido