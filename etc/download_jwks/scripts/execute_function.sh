#!/bin/bash
set -eu

aws lambda invoke --function-name usermgr_dl_jwks result.txt \
--log-type Tail --query 'LogResult' --output text | base64 -d
cat result.txt | jq .
rm result.txt
