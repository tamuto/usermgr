variable "region" {
    description = "AWS region"
    default = "ap-northeast-1"
}

variable "profile" {
    description = "AWS profile"
}

variable "user_pool_name" {
    description = "Cognito User Pool Name"
    default = "usermgr-test-users"
}

variable "user_pool_domain" {
    description = "Cognito User Pool Domain"
    default = "usermgr-test"
}

variable "user_pool_client_name" {
    description = "Cognito User Pool Client Name"
    default = "usermgr-test-client"
}

variable "from_email_address" {
    description = "From Email Address"
}
