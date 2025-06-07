# Testing Guide

This document provides guidance on testing the usermgr library.

## Environment Setup

### Method 1: Environment Variables (Recommended)

Create a `.env` file in the `library/` directory (copy from `.env.example`):

```bash
# Provider selection (choose one)
AWS_COGNITO=true        # For direct API testing
# AWS_LAMBDA=true       # For Lambda proxy testing

# AWS Configuration
AWS_REGION=ap-northeast-1
AWS_PROFILE=your_aws_profile  # Optional

# Cognito Configuration (required for AWS_COGNITO tests)
USERPOOL_ID=ap-northeast-1_xxxxxxxxx
CLIENT_ID=your_client_id
SECRET=your_client_secret

# Lambda Configuration (required for AWS_LAMBDA tests)
LAMBDA_FUNCTION_NAME=usermgr
```

### Method 2: Export Environment Variables

```bash
export AWS_COGNITO=true
export AWS_REGION=ap-northeast-1
export USERPOOL_ID=ap-northeast-1_xxxxxxxxx
export CLIENT_ID=your_client_id
export SECRET=your_client_secret
```

## Running Tests

### All Tests (including skipped environment-dependent tests)
```bash
cd library/
python -m pytest tests/ -v
```

### Basic Tests Only (no AWS dependencies)
```bash
cd library/
python -m pytest tests/test_factory.py::TestFactory::test_create_cognito -v
python -m pytest tests/test_factory.py::TestFactory::test_create_lambda -v
python -m pytest tests/test_factory.py::TestFactory::test_get_instance_invalid_provider -v
```

### Environment-dependent Tests
```bash
# After setting up environment variables
cd library/
python -m pytest tests/ -v -k "not skip"
```

## Test Structure

### Unit Tests
- `test_factory.py` - Factory pattern and provider creation
- `test_cognito.py` - Cognito provider functionality (requires AWS config)
- `test_lambda.py` - Lambda provider functionality (requires AWS config)

### Test Categories

1. **Basic Tests** - No AWS credentials required
   - Provider instantiation
   - Invalid parameter handling
   - Factory pattern behavior

2. **Environment Tests** - Require AWS configuration
   - Actual Cognito operations
   - Lambda function calls
   - Authentication flows

## Manual Testing

### Using the Library Directly

```python
from usermgr.Factory import Factory

# Test factory creation
um = Factory.create(Factory.AWS_COGNITO, 
                   region='ap-northeast-1',
                   user_pool_id='your_pool_id',
                   client_id='your_client_id',
                   client_secret='your_secret')

# Test basic operations
print(um.list_users())
```

### Using Environment-based Configuration

```python
import os
from usermgr.Factory import Factory

# Set provider
os.environ['AWS_COGNITO'] = 'true'

# Get singleton instance
um = Factory.get_usermgr()
print(um.list_users())
```

## Troubleshooting

### Common Issues

1. **Tests Skipped**: Set environment variables as described above
2. **AWS Credentials Error**: Configure AWS CLI profile or set AWS credentials
3. **Cognito Permissions**: Ensure your AWS credentials have Cognito access
4. **Lambda Not Found**: Deploy Lambda function using platform scripts

### Debug Mode

```bash
# Run with debug output
python -m pytest tests/ -v -s --tb=long
```