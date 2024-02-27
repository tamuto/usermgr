#!/bin/bash
set -eu

python -m zipfile -c lambda.zip usermgr/src/usermgr.py

aws lambda create-function --function-name $LAMBDA_NAME_USERMGR \
--zip-file fileb://lambda.zip --handler usermgr.handler --runtime python3.11 \
--environment "Variables={USERPOOL_ID=$USERPOOL_ID,CLIENT_ID=$CLIENT_ID,SECRET=$SECRET}" \
--role arn:aws:iam::$ACCOUNT_ID:role/$ROLE | jq .

rm lambda.zip
