# User Management Tools & Library

## Overview

This is a comprehensive library and tools suite for AWS Cognito user management, designed to handle various network environments and security requirements.

The project provides the following components:

- **Python library (usermgr)** - Core user management library with provider pattern
- **Lambda functions** - AWS Cognito operations via serverless functions
- **Terraform configurations** - Infrastructure as Code for AWS Cognito setup
- **Web-based test UI** - React application for testing user management
- **Administrative tools** - Web-based management interface
- **UI converter** - Tool for converting shadcn/ui to AWS Cognito branding

## Network Environment Support

This project supports multiple network configurations:

### 1. **IPv6 + EGRESS_ONLY_INETGW (Recommended)**
- **Direct Cognito API access** via IPv6 connectivity
- Lower latency and cost compared to Lambda proxy
- Suitable for modern AWS environments with IPv6 support

### 2. **Lambda Proxy (Legacy/High Security)**
- **Lambda-mediated operations** for complete network isolation
- Required for private subnets without direct internet access
- Ideal for high-security environments with strict external communication restrictions

### 3. **Hybrid Approach**
- Runtime switching between direct API and Lambda proxy
- Configurable via environment variables or factory parameters

## Description of each tool and library

### usermgr library

- Python library providing unified interface for AWS Cognito user management
- Supports comprehensive user and group operations (CRUD, password management, etc.)
- **Provider pattern architecture** with abstract base class for extensibility
- **Dual access modes**:
  - **Direct API**: Direct AWS Cognito API calls (IPv6 compatible)
  - **Lambda Proxy**: Operations via Lambda functions for isolated environments
- Environment-based configuration with singleton pattern support

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
from usermgr.Factory import Factory

# Option 1: Environment-based singleton (recommended)
um = Factory.get_usermgr()  # Uses AWS_COGNITO env var to determine provider

# Option 2: Direct Cognito operation (IPv6 environments)
instance = Factory.get_instance(Factory.AWS_COGNITO, 
                               region='<AWS_REGION>', 
                               user_pool_id='<USER_POOL_ID>', 
                               client_id='<CLIENT_ID>', 
                               client_secret='<CLIENT_SECRET>')

# Option 3: Lambda operation (private subnets/high security)
instance = Factory.get_instance(Factory.AWS_LAMBDA, 
                               function_name='<LAMBDA_FUNCTION_NAME>')

# User Management Operations
instance.add_user('username', 'password', {
    'custom:extra_info': 'extra_info'
})

instance.update_user('username', {
    'custom:extra_info': 'updated_info'
})

instance.set_password('username', 'new_password', permanent=True)
instance.delete_user('username')

# User Queries
if instance.is_exist_user('username'):
    print('User exists')

user_info = instance.get_user('username')
users_list = instance.list_users()

# Group Management
instance.add_group('groupname', 'description')
instance.add_user_to_group('username', 'groupname')
instance.remove_user_from_group('username', 'groupname')
instance.delete_group('groupname')

# Authentication Support
instance.authenticate_user('username', 'password')
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

Create the `platform/etc/.env` file with the following settings:

| Name | Description | Example |
| ---- | ----------- | ------- |
| AWS_ACCESS_KEY_ID | AWS Access key ID (optional if using AWS Profile) | `AKIAIOSFODNN7EXAMPLE` |
| AWS_SECRET_ACCESS_KEY | AWS Secret access key (optional if using AWS Profile) | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| AWS_PROFILE | AWS CLI profile name (recommended) | `default` |
| AWS_REGION | AWS region | `ap-northeast-1` |
| ACCOUNT_ID | AWS account ID | `123456789012` |
| ROLE | IAM role name for Lambda functions | `usermgr-lambda-role` |
| LAMBDA_NAME_USERMGR | Lambda function name for user management | `usermgr` |
| LAMBDA_NAME_DOWNLOAD | Lambda function name for JWKS download | `usermgr_download_jwks` |
| USERPOOL_ID | Cognito user pool ID | `ap-northeast-1_xxxxxxxxx` |
| CLIENT_ID | Cognito client ID | `1234567890abcdefghijk` |
| SECRET | Cognito client secret | `abcdefghijklmnop1234567890` |

**Security Note**: Use AWS Profile or IAM roles instead of hardcoding access keys when possible.

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

The `testui` directory contains a React-based test interface for user management operations. It provides:

- AWS Amplify integration for Cognito authentication
- Japanese language support
- Sign-in/sign-out functionality
- User management testing interface

Setup and usage:

```bash
cd testui
pnpm install    # Install dependencies
pnpm dev        # Start development server (port 8080)
pnpm build      # Production build
```

**Configuration**: Requires Cognito configuration in environment variables or config files.

### Administrative Tools

The `tools` directory provides a web-based administrative interface built with React and TanStack Router:

- React-based management interface
- Modern routing with TanStack Router
- Administrative operations for user management
- Environment configuration support

Setup and usage:

```bash
cd tools
pnpm install    # Install dependencies
pnpm dev        # Start development server (port 8080)
pnpm build      # Production build
```

**Note**: This tool is currently in development with basic routing structure in place.

### UI Converter (platform/converter)

Tool for converting shadcn/ui components to AWS Cognito Managed Login branding format:

- Converts modern UI components to Cognito-compatible styling
- Supports branding customization for Cognito hosted UI
- Build artifacts available in `dist/` directory

**Note**: This tool requires setup completion (package.json configuration needed).

## Environment Configuration

### Provider Selection

The library automatically selects the appropriate provider based on environment variables:

```bash
# For direct Cognito API access (IPv6 environments)
export AWS_COGNITO=true

# For Lambda proxy access (private subnets)
export AWS_LAMBDA=true
```

### Testing Configuration

For running tests, set up the following environment variables:

```bash
export AWS_REGION=ap-northeast-1
export USERPOOL_ID=your_user_pool_id
export CLIENT_ID=your_client_id
export SECRET=your_client_secret
export LAMBDA_FUNCTION_NAME=your_lambda_function_name
```

## Troubleshooting

### Common Issues

1. **Factory.create() not working**: Use `Factory.get_instance()` instead (see Usage section)
2. **Tests skipped**: Configure environment variables as described above
3. **IPv6 connectivity**: Ensure EGRESS_ONLY_INETGW is properly configured in your VPC
4. **Lambda timeout**: Increase timeout settings for user management operations

## How To Remove the User Management Tools & Library

Follow these steps from the `platform/etc` directory:

1. **Remove Lambda triggers** from Cognito (if any) before deleting functions
2. **Delete Lambda functions**:
   ```bash
   dotenv run aws lambda delete-function --function-name usermgr
   dotenv run aws lambda delete-function --function-name usermgr_download_jwks
   ```
3. **Delete IAM role**:
   ```bash
   dotenv run aws iam delete-role --role-name usermgr-lambda-role
   ```
4. **Clean up Terraform resources** (if used):
   ```bash
   cd platform/terraform
   terraform destroy
   ```

Replace function and role names with those specified in your environment settings.
