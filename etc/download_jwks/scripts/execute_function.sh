#!/bin/bash
set -eu

aws lambda invoke --function-name $LAMBDA_NAME_DOWNLOAD result.txt \
--log-type Tail --query 'LogResult' --output text | base64 -d
cat result.txt | jq .
rm result.txt
