#!/bin/bash

# clean build dir
rm -rf ./build

# run npm commands
npm run clean
npm run build
npm run copy-files

#cp -r ./dist ./build
cd ./build

# install dependencies
sudo npm install --production

# clear node_modules
node-prune

# create tarball archiv from build dir
# tar -cvzf
#tar -cvzf $(pwd)/release-linux.tgz $(pwd)/build
echo "-- TODO CREATE TARBALL ARCHIV --"