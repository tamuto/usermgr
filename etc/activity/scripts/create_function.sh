#!/bin/bash
set -eu

python -m zipfile -c lambda.zip activity/src/activity.py

aws lambda create-function --function-name $LAMBDA_NAME_ACTIVITY \
--zip-file fileb://lambda.zip --handler activity.handler --runtime python3.11 \
--environment "Variables={DYNAMODB_NAME=$DYNAMODB_NAME}" \
--role arn:aws:iam::$ACCOUNT_ID:role/$ROLE | jq .

rm lambda.zip
