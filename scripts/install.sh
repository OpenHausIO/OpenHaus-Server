#!/bin/bash


curl https://github.com/OpenHausIO/OpenHaus-Server/releases/linux-x64.tgz --output /tmp/open-haus.tgz
tar zxvf /tmp/open-haus.tgz -C /opt/OpenHaus-Server --strip 1
# tar -tf ZendFramework-1.7.2.tar.gz | head
# https://www.marksanborn.net/linux/extract-without-first-directory/