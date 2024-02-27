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
aws iam attach-role-policy --role-name $ROLE --policy-arn arn:aws:iam::aws:policy/AmazonCognitoPowerUser | jq .

JSON=$(cat << EOS
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": "arn:aws:dynamodb:$AWS_REGION:$ACCOUNT_ID:table/$DYNAMODB_NAME"
    }
  ]
}
EOS
)

aws iam create-policy --policy-name $DYNAMODB_ACTIVITY_POLICY --policy-document "$JSON" | jq .
aws iam attach-role-policy --role-name $ROLE --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/$DYNAMODB_ACTIVITY_POLICY | jq .
