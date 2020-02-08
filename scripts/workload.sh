#!/bin/bash

nworkers=${1:-100}
domain=${2:-http://webserver.com/}

aux=""
code=0
res_time="$(curl -s -o /dev/null -m 3 -w "%{http_code} %{time_starttransfer}" "$domain" &)"
for ((i=0; i < $nworkers-1; i++ )); do
    aux="$(curl -s -o /dev/null -m 1 -w "%{http_code} %{time_starttransfer}" "$domain" &)"

    read -d ' ' code < <(echo $aux)
    if [ "x$code" != "x200" ]; then
        echo "$aux" >> curl_requests_failed.log
    else
        res_time="$res_time\n$aux"
    fi
done

wait

echo -e "$res_time"

exit 0

