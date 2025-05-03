#!/bin/bash
set -eu

python -m zipfile -c lambda.zip download_jwks/src/usermgr_dl_jwks.py

dotenv run aws lambda update-function-code --function-name $LAMBDA_NAME_DOWNLOAD \
--zip-file fileb://lambda.zip --publish | jq .

rm lambda.zip
