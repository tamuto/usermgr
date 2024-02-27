#!/bin/bash
set -eu

python -m zipfile -c lambda.zip activity/src/activity.py

dotenv run aws lambda update-function-code --function-name $LAMBDA_NAME_ACTIVITY \
--zip-file fileb://lambda.zip --publish | jq .

rm lambda.zip
