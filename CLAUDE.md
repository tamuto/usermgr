# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Comprehensive AWS Cognito user management system supporting multiple network environments:

- **library/**: Core Python library with dual provider support (direct API + Lambda proxy)
- **platform/**: Infrastructure (Terraform), Lambda functions, and UI converter
- **testui/**: React test interface with AWS Amplify integration
- **tools/**: Administrative web interface (React + TanStack Router)

## Network Environment Strategy

### IPv6 + EGRESS_ONLY_INETGW (Recommended)
- Direct Cognito API access via IPv6
- Lower latency and cost
- Suitable for modern AWS environments

### Lambda Proxy (Legacy/High Security)
- Complete network isolation via Lambda functions
- Required for strict security environments
- Supports private subnets without direct internet access

## Development Commands

### Library (Python - from library/)
```bash
poetry install              # Base dependencies
poetry install -E cognito   # With Cognito provider  
poetry install -E lambda    # With Lambda provider
python -m pytest tests/     # Run tests (requires environment setup)
```

### Test UI (from testui/)
```bash
pnpm install    # Install dependencies
pnpm dev        # Start dev server (port 8080)
pnpm build      # Production build
```

### Administrative Tools (from tools/)
```bash
pnpm install    # Install dependencies
pnpm dev        # Start dev server (port 8080) 
pnpm build      # Production build
```

### Platform Deployment (from platform/etc/)
```bash
# 1. Setup .env file first (see README)
# 2. Create IAM role
dotenv run ./role/scripts/create_role.sh

# 3. Deploy Lambda functions
dotenv run ./usermgr/scripts/create_function.sh
dotenv run ./download_jwks/scripts/create_function.sh

# 4. Update existing functions
dotenv run ./usermgr/scripts/update_function.sh
dotenv run ./download_jwks/scripts/update_function.sh
```

### Terraform Infrastructure (from platform/terraform/)
```bash
terraform init
terraform plan
terraform apply
```

## Architecture Details

### Core Library Pattern
- **Abstract Base**: `usermgr/base.py` - UserManager interface
- **Providers**: 
  - `cognito.py` - Direct AWS API (boto3, IPv6 compatible)
  - `lambda.py` - Lambda proxy for isolated environments
- **Factory**: `usermgr/Factory.py` - Provider selection and singleton management

### Known Issues to Fix
- **Factory.py**: `create()` method not implemented (use `get_instance()`)
- **Terraform**: Typos in variable names (`callback_ur_ls` → `callback_urls`)
- **Tests**: All skipped due to missing environment configuration

### Provider Selection Logic
```python
from usermgr.Factory import Factory

# Environment-based automatic selection
um = Factory.get_usermgr()  # Uses AWS_COGNITO/AWS_LAMBDA env vars

# Manual provider specification
cognito_mgr = Factory.get_instance(Factory.AWS_COGNITO, **cognito_config)
lambda_mgr = Factory.get_instance(Factory.AWS_LAMBDA, function_name="usermgr")
```

### Environment Configuration

**Required Environment Variables**:
```bash
# Provider selection
AWS_COGNITO=true        # Enable direct API mode
AWS_LAMBDA=true         # Enable Lambda proxy mode

# Cognito configuration
AWS_REGION=ap-northeast-1
USERPOOL_ID=ap-northeast-1_xxxxxxxxx
CLIENT_ID=your_client_id
SECRET=your_client_secret

# Lambda configuration (when using proxy)
LAMBDA_FUNCTION_NAME=usermgr
```

### Component Status

**Complete (95%)**:
- Core library functionality
- Provider implementations  
- Lambda functions and deployment scripts
- Basic React UIs

**Needs Attention**:
- Factory.py create() method implementation
- Terraform variable name corrections
- Test environment setup
- Tools administrative functionality
- Platform converter setup (missing package.json)

**Development Priorities**:
1. Fix Factory.py and Terraform typos (immediate)
2. Complete test environment setup
3. Implement administrative tools functionality
4. Finalize platform converter tool

### UI Architecture Notes
- **testui/**: Full AWS Amplify integration, ready for Cognito auth testing
- **tools/**: TanStack Router foundation, needs user management implementation
- **React Pattern**: Both use modern React with TypeScript, Tailwind CSS
- **Build System**: Rsbuild for both projects

### Security Considerations
- HMAC secret hash generation for Cognito operations
- JWT validation via JWKS download Lambda
- Environment-based configuration to avoid hardcoded secrets
- IAM role-based access for Lambda functions

### Testing Strategy
Configure environment variables in `.env` or export directly:
```bash
export AWS_REGION=ap-northeast-1
export USERPOOL_ID=your_test_pool
# ... other variables
python -m pytest tests/ -v
```