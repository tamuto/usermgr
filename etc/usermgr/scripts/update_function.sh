#!/bin/bash
set -eu

python -m zipfile -c lambda.zip usermgr/src/usermgr.py

dotenv run aws lambda update-function-code --function-name usermgr \
--zip-file fileb://lambda.zip --publish | jq .

rm lambda.zip
