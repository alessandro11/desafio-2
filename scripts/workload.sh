#!/bin/bash

nworkers=${1:-100}
domain=${2:-http://webserver.com/}
pids=""
failed=0

res_time="$(curl -s -o /dev/null -m 3 -w "%{http_code} %{time_starttransfer}" "$domain" &)"
for ((i=0; i < $nworkers-1; i++ )); do
    res_time="${res_time},$(curl -s -o /dev/null -m 3 -w "%{http_code} %{time_starttransfer}" "$domain" &)"
done

wait

echo "$res_time"
echo "Failed: $failed"

exit 0

