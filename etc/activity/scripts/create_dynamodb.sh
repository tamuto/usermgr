#!/bin/bash
set -eu

aws dynamodb create-table \
    --table-name $DYNAMODB_NAME \
    --attribute-definitions AttributeName=user_id,AttributeType=S \
    --key-schema AttributeName=user_id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST | jq .
