# User Management Tools & Library

## Overview

This is a library and tools for user management.
It provides the following functions:

- Python library (usermgr) for user management
- Lambda functions for AWS Cognito user management
- Terraform configurations for AWS Cognito setup
- Web-based test UI for user management
- Command-line tools for user management

## Description of each tool and library

### usermgr library

- This is a Python library for user management.
- It provides functions such as adding, updating, deleting, and searching users, as well as group management.
- At the moment, it supports AWS Cognito.
- It supports both direct operation of Cognito API and operation via Lambda function.
  - Use a Lambda function when you cannot directly operate Cognito from a private subnet.
- In the future, it is planned to support other user management services. The structure of the library is designed with an abstract base class so that different providers can be implemented with the same interface.

#### Install

- When directly operating Cognito API:

```bash
pip install usermgr[cognito]
```

- When operating via Lambda function:

```bash
pip install usermgr[lambda]
```

#### Usage

```python
from usermgr import Factory

# For direct Cognito operation
instance = Factory.create(Factory.AWS_COGNITO, 
                         region='<AWS_REGION>', 
                         user_pool_id='<USER_POOL_ID>', 
                         client_id='<CLIENT_ID>', 
                         client_secret='<CLIENT_SECRET>')

# For Lambda operation
instance = Factory.create(Factory.AWS_LAMBDA, 
                         function_name='<LAMBDA_FUNCTION_NAME>')

# Add a user
instance.add_user('username', 'password', {
    'custom:extra_info': 'extra_info'
})

# Update user attributes
instance.update_user('username', {
    'custom:extra_info': 'updated_info'
})

# Set a new password
instance.set_password('username', 'new_password', permanent=True)

# Delete a user
instance.delete_user('username')

# Check if a user exists
if instance.is_exist_user('username'):
    print('User exists')

# Add a user to a group
instance.add_user_to_group('username', 'groupname')

# Create a new group
instance.add_group('groupname', 'description')

# Delete a group
instance.delete_group('groupname')
```

- Please refer to `usermgr/base.py` for all available functions.

### Terraform Configuration

The repository includes Terraform configuration files in the `platform/terraform` directory that help you set up AWS Cognito user pools. These configurations provide:

- Cognito User Pool with customizable settings
- User Pool Client for application integration
- User Pool Domain for authentication endpoints
- Managed login branding support

To use these configurations, navigate to the `platform/terraform` directory and customize the variables in `variables.tf` to match your requirements.

### Cognito User Management Lambda Functions

- Used when operating Cognito via Lambda function from a private subnet.
- Follow the steps below after moving to the `platform/etc` folder.

#### 1. Create an environment configuration file

- Create the `platform/etc/.env` file.
- The settings are as follows:
  - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_PROFILE should be set according to the aws cli configuration file.

| Name | Description |
| ---- | ----------- |
| AWS_ACCESS_KEY_ID | Access key ID |
| AWS_SECRET_ACCESS_KEY | Secret access key |
| AWS_PROFILE | Profile name in the aws cli configuration file |
| AWS_REGION | Region name |
| ACCOUNT_ID | AWS account ID |
| ROLE | IAM role name to be granted to the Lambda function |
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
LAMBDA_NAME_USERMGR=usermgr
LAMBDA_NAME_DOWNLOAD=usermgr_download_jwks

USERPOOL_ID=ap-northeast-1_xxxxxx
CLIENT_ID=xxxxxx
SECRET=xxxxx
```

#### 2. IAM role creation

- Execute the following command in the etc folder:

```bash
dotenv run ./role/scripts/create_role.sh
```

#### 3. Register Lambda functions

##### 3-1. Create a Lambda function for user management

- Execute the following command in the etc folder:

```bash
dotenv run ./usermgr/scripts/create_function.sh
```

To update an existing function:

```bash
dotenv run ./usermgr/scripts/update_function.sh
```

##### 3-2. Create a Lambda function for JWKS download

- Execute the following command in the etc folder:
- This function is needed when using Cognito's ID token validation in the private subnet.

```bash
dotenv run ./download_jwks/scripts/create_function.sh
```

To update an existing function:

```bash
dotenv run ./download_jwks/scripts/update_function.sh
```

To execute the function:

```bash
dotenv run ./download_jwks/scripts/execute_function.sh
```

### Web-based Test UI

The repository includes a web-based test UI for user management in the `testui` directory. This UI is built using React and can be used to test user management functions.

Setup:

```bash
cd testui
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

### Command-line Tools

The repository includes command-line tools for user management in the `tools` directory. These tools are built using Bun.

Setup:

```bash
cd tools
bun install
```

Run:

```bash
bun run index.ts
```

## How To Remove the User Management Tools & Library

- Follow the steps below after moving to the etc folder.
- If you are referring to Lambda from Cognito, remove the Lambda trigger from Cognito before deleting the Lambda function.
- Replace each name with the one specified in the environment settings.

```bash
dotenv run aws lambda delete-function --function-name usermgr
dotenv run aws lambda delete-function --function-name usermgr_dl_jwks
dotenv run aws iam delete-role --role-name usermgr-lambda-role
```
