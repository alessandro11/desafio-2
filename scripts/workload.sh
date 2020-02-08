#!/bin/bash

nworkers=${1:-100}
domain=${2:-http://webserver.com}
pids=""
failed=0

declare -r routes=('' 'health' 'route1' 'route2' 'route3')

route=""
index=0
for ((i=0; i < $nworkers-1; i++ )); do
    index=$(($RANDOM % 5))
    route="${routes[index]}"

    echo "$index: Request: $domain/$route"
    curl -s -o /dev/null -m 1 -w "%{http_code} %{time_starttransfer}\n" "$domain/$route"  >> ${nworkers}_curl_responses.log 2>&1 &
    pids="$pids $!"
done

for pid in $pids; do
    echo "job: $pid"
    wait $pid || let "failed+=1"
done

echo "Failed: $failed"

exit 0

