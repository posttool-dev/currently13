#!/bin/sh
#/etc/profile.d/nodejs.sh

NODE_PATH=/usr/lib/nodejs:/usr/lib/node_modules:/usr/share/javascript
export NODE_PATH

NODE_ENV="<%- node.env %>"
export NODE_ENV