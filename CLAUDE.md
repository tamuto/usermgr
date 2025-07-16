# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

### Primary Project Focus

**SignFlow** (`packages/signflow/`) is now the main development focus - a headless authentication framework for React applications. This framework provides complete authentication flow management without UI components, allowing developers to implement authentication while maintaining full control over interface design.

### Legacy Components (Maintenance Mode)

The following components remain in the repository for compatibility but are no longer actively developed:

- **library/**: Core Python library with dual provider support (direct API + Lambda proxy)
- **platform/**: Infrastructure (Terraform), Lambda functions, and Cognito branding converter
- **testui/**: React test interface with AWS Amplify integration
- **tools/**: Administrative web interface (React + TanStack Router)

**Important**: Legacy components should not be modified or enhanced. They are preserved for existing integrations and compatibility purposes only.

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

### SignFlow (Primary Project - from packages/signflow/)
```bash
pnpm install    # Install dependencies
pnpm dev        # Start development server
pnpm build      # Production build
pnpm test       # Run tests
pnpm lint       # Run linting
```

### Legacy Components (Maintenance Mode Only)

**Note**: The following commands are provided for reference but should not be used for new development.

#### Library (Python - from library/)
```bash
poetry install              # Base dependencies
poetry install -E cognito   # With Cognito provider  
poetry install -E lambda    # With Lambda provider
python -m pytest tests/     # Run tests (requires environment setup)
```

#### Test UI (from testui/)
```bash
pnpm install    # Install dependencies
pnpm dev        # Start dev server (port 8080)
pnpm build      # Production build
```

#### Administrative Tools (from tools/)
```bash
pnpm install    # Install dependencies
pnpm dev        # Start dev server (port 8080) 
pnpm build      # Production build
```

#### Platform Deployment (from platform/etc/)
```bash
# 1. Setup .env file first (see README)
# 2. Create IAM role
dotenv run ./role/scripts/create_role.sh

# 3. Deploy Lambda functions
dotenv run ./usermgr/scripts/create_function.sh
dotenv run ./download_jwks/scripts/create_function.sh
```

#### Cognito Branding Converter (from platform/converter/)
```bash
pnpm install       # Install dependencies
pnpm build         # Build TypeScript to JavaScript
pnpm start         # Run converter tool
```

#### Terraform Infrastructure (from platform/terraform/)
```bash
terraform init
terraform plan
terraform apply
```

## Architecture Details

### SignFlow Architecture (Primary Focus)

SignFlow follows a headless authentication framework pattern:

- **Provider-agnostic**: Abstract authentication interface supporting multiple providers
- **React-focused**: Hooks-based API for seamless React integration
- **State-driven**: Comprehensive state management for authentication flows
- **Flow-based**: Step-by-step authentication processes with validation
- **TypeScript-first**: Complete type safety and developer experience

Key components:
- **SignFlowProvider**: Context provider for authentication state
- **Hooks**: useSignIn, useSignUp, usePasswordReset, useAuthState
- **Flow Engine**: State machine for authentication processes
- **Provider Interface**: Extensible authentication backend support

### Legacy Architecture (Reference Only)

#### Core Library Pattern
- **Abstract Base**: `usermgr/base.py` - UserManager interface
- **Providers**: 
  - `cognito.py` - Direct AWS API (boto3, IPv6 compatible)
  - `lambda.py` - Lambda proxy for isolated environments
- **Factory**: `usermgr/Factory.py` - Provider selection, singleton management, and instance creation

### Cognito Branding Converter
- **Purpose**: Convert shadcn/ui CSS variables to AWS Cognito Managed Login branding format
- **Input**: shadcn/ui `globals.css` with CSS custom properties
- **Output**: Terraform `awscc_cognito_managed_login_branding` resource
- **Features**:
  - OKLCH to HEX color conversion
  - Light/Dark mode support
  - Button, form, focus, and status styling
  - Automatic Terraform resource generation

### Status Update (Latest)
- **Factory.py**: ✅ `create()` method fully implemented and working
- **Terraform**: Variable names `callback_ur_ls`/`logout_ur_ls` are correct (awscc provider syntax)
- **Tests**: Environment-dependent tests available with proper setup
- **Converter**: ✅ Full implementation with minor TypeScript fixes applied

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

#### SignFlow (Active Development)

**In Progress**:
- [ ] Core framework structure and package setup
- [ ] Basic authentication hooks (useSignIn, useSignUp)
- [ ] Cognito provider integration
- [ ] State management system
- [ ] TypeScript definitions and documentation

**Development Priorities**:
1. Implement basic authentication flow hooks
2. Create Cognito provider integration
3. Add comprehensive state management
4. Develop testing framework and examples
5. Create documentation and developer guides

#### Legacy Components (Maintenance Mode)

**Complete (95%+)** - No further development:
- ✅ Core library functionality (Factory.py fully implemented)
- ✅ Provider implementations (Cognito + Lambda)
- ✅ Lambda functions and deployment scripts
- ✅ Cognito branding converter (shadcn/ui → AWS Cognito branding)
- ✅ Test UI with AWS Amplify integration
- ✅ Environment-based testing framework
- ✅ Administrative tools UI (user list, user creation forms, group management)
- ✅ Comprehensive group management with member operations
- ✅ Production-ready converter tool with TypeScript fixes

### UI Architecture Notes (Legacy - Reference Only)
- **testui/**: Full AWS Amplify integration with Japanese localization, ready for Cognito auth testing
- **tools/**: Production-ready admin interface with complete user/group management capabilities
  - User creation with custom attributes and validation
  - Group management with member assignment/removal
  - Advanced user listing with search and filtering
  - Real-time Cognito API integration via Zustand
- **converter/**: Production CLI tool with TypeScript, supports OKLCH color conversion and Terraform generation
- **React Pattern**: Modern React with TypeScript, Tailwind CSS, shadcn/ui components
- **Build System**: Rsbuild for UIs, standard TypeScript compilation for converter

**Note**: These components are maintained for compatibility but not actively developed. New authentication UI should use SignFlow.

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