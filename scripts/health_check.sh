#!/usr/bin/env bash

shopt -s lastpipe

. /etc/default/CREATED_USER

#
# Do not restart, unless no process could be found
# or /health does not respond.
restart=1

#
# Check if there is a node per core
#
np=0
ps -e -o pid,cmd | grep node |
while read pid proc param; do
    if [[ $proc =~ ^/home/CREATED_USER/.*/node.* ]] && \
       [ "$param" == "/home/CREATED_USER/desafio-2/server.js -d" ]; then
        np=$((np+1))
    fi
done

# +1 Node process, master of the cluster.
nump=$(nproc)
nump=$((nump+1))
if [ $nump -eq $np ]; then
    #
    # Check the route response.
    #
    res=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN")
    [ $res -ne 200 ] && restart=0
else
    restart=0;
fi

if [ $restart -eq 0 ]; then
    systemctl restart CREATED_USER.service
fi

exit 0
