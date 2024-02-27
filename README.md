# User Management Tools & Library

## Overview

This is a library and tools for user management.
It provides the following functions.

- usermgr library for Python
- Lambda functions for Cognito user management
- DynamoDB definition and Lambda functions for Cognito user activity management
- [Under construction] GUI tool for user management

## Description of each tool and library

### usermgr library

- This is a Python library for user management.
- It provides functions such as adding, updating, deleting, and searching users.
- At the moment, it supports AWS Cognito.
- It supports both direct operation of Cognito API and operation via Lambda function.
  - Use a Lambda function when you cannot directly operate Cognito from a private subnet.
- In the future, it is planned to support other user management services. The structure of the library will be kept the same so that it can be used when other services are supported.

#### Install

- When directly operating Cognito API

```bash
pip install usermgr[cognito]
```

- When operating via Lambda function

```bash
pip install usermgr[lambda]
```

#### Usage

```python
from usermgr import Factory

instance = Factory.create(Factory.AWS_COGNITO)  # For Lambda, use Factory.AWS_LAMBDA

instance.add_user('username', 'password', {
    'custom:extra_info': 'extra_info'
})
```

- Please refer to usermgr/base.py for available functions.

### Cognito user management Lambda function

- Used when operating Cognito via Lambda function from a private subnet.
- Follow the steps below after moving to the etc folder.

#### 1. Create an environment configuration file

- Create the etc/.env file.
- The settings are as follows.
  - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_PROFILE should be set according to the aws cli configuration file.

| Name | Description |
| ---- | ----------- |
| AWS_ACCESS_KEY_ID | Access key ID |
| AWS_SECRET_ACCESS_KEY | Secret access key |
| AWS_PROFILE | Profile name in the aws cli configuration file |
| AWS_REGION | Region name |
| ACCOUNT_ID | AWS account ID |
| ROLE | IAM role name to be granted to the Lambda function |
| DYNAMODB_ACTIVITY_POLICY | DynamoDB access policy name to be granted to the role |
| DYNAMODB_NAME | DynamoDB table name |
| LAMBDA_NAME_ACTIVITY| Lambda function name for user activity management |
| LAMBDA_NAME_USERMGR| Lambda function name for user management |
| LAMBDA_NAME_DOWNLOAD| Lambda function name for JWKS download |
| USERPOOL_ID | Cognito user pool ID |
| CLIENT_ID | Cognito client ID |
| SECRET | Cognito client secret |

- Example (Modify as needed for your environment)

```ini
AWS_PROFILE=xxxx
AWS_REGION=ap-northeast-1

ACCOUNT_ID=xxxxxx
ROLE=usermgr-lambda-role
DYNAMODB_ACTIVITY_POLICY=usermgr_activity_policy
DYNAMODB_NAME=usermgr_activity
LAMBDA_NAME_ACTIVITY=usermgr_activity
LAMBDA_NAME_USERMGR=usermgr
LAMBDA_NAME_DOWNLOAD=usermgr_download_jwks

USERPOOL_ID=ap-northeast-1_xxxxxx
CLIENT_ID=xxxxxx
SECRET=xxxxx
```

#### 2. IAM role creation

- execute the following command in the etc folder.

```bash
dotenv run ./role/scripts/create_role.sh
```

#### 3. Register Lambda function

##### 3-1. Create a Lambda function for user management

- execute the following command in the etc folder.

```bash
dotenv run ./usermgr/scripts/create_usermgr.sh
```

##### 3-2. Create a Lambda function for JWKS download

- execute the following command in the etc folder.
- this function is needed when using Cognito's ID token validation in the private subnet.

```bash
dotenv run ./download_jwks/scripts/create_function.sh
```

- Please incorporate Lambda execution into each project by referring to ./download_jwks/scripts/create_function.sh.

##### 3-3. Create a Lambda function for user activity management

- execute the following command in the etc folder.

```bash
dotenv run ./activity/scripts/create_dynamodb.sh
dotenv run ./activity/scripts/create_function.sh
```

- Please regist the Lambda function with PreCreate Token Lambda Trigger in Cognito User Pool.

## How To Remove the User Management Tools & Library

- Follow the steps below after moving to the etc folder.
- If you are referring to Lambda from Cognito, remove the Lambda trigger from Cognito before deleting the Lambda function.
- Replace each name with the one specified in the environment settings.

```bash
dotenv run aws lambda delete-function --function-name usermgr
dotenv run aws lambda delete-function --function-name usermgr_dl_jwks
dotenv run aws lambda delete-function --function-name usermgr_activity
dotenv run aws dynamodb delete-table --table-name usermgr_activity
dotenv run aws iam delete-role --role-name usermgr-lambda-role
dotenv run aws iam delete-policy --policy-name usermgr_activity_policy
```
