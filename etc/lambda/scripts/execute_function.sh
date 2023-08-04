#!/bin/bash
set -eu

PAYLOAD=$(cat << EOS
{
    "type": "$1"
}
EOS
)
aws lambda invoke --function-name usermgr result.txt \
--cli-binary-format raw-in-base64-out \
--payload "$PAYLOAD" \
--log-type Tail --query 'LogResult' --output text | base64 -d
cat result.txt | jq .
rm result.txt
