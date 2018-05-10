#!/bin/sh

set +x

# Replace ${VAULT_API_URL}
VAULT_URL=$(echo ${VAULT_API_URL} | sed -e 's/\//\\\//g')
sed -i 's/${VAULT_API_URL}/'${VAULT_URL}'/g' ./config.js

exec "$@"
