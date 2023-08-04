#!/bin/bash
set -eu

JSON=$(cat << EOS
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOS
)

aws iam create-role --role-name $ROLE --assume-role-policy-document "$JSON" | jq .
aws iam attach-role-policy --role-name $ROLE --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole | jq .
