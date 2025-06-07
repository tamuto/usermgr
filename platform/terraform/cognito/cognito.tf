provider "aws" {
    region = var.region
    profile = var.profile
}

provider "awscc" {
    region = var.region
    profile = var.profile
}

data "aws_ses_email_identity" "ses" {
    email = var.from_email_address
}

resource "aws_cognito_user_pool" "user_pool" {
    name = var.user_pool_name

    # デフォルトはESSENTIALSだが、明示しておく
    user_pool_tier = "ESSENTIALS"

    # 誤ったユーザプール削除を禁止
    # deletion_protection = "ACTIVE"

    admin_create_user_config {
        # アプリケーション経由でのユーザー登録を許可
        allow_admin_create_user_only = false
        # 招待メッセージのテンプレート構造（FIXME いつ使われる？）
        invite_message_template {
            email_subject = "Invitation to join our awesome app"
            email_message = <<-EOT
Invitation to join our awesome app.<br>
Your username is {username} and temporary password is {####}.
EOT
            sms_message = "Your username is {username} and temporary password is {####}."
        }
    }

    username_attributes = ["email"]
    username_configuration {
        case_sensitive = false
    }

    password_policy {
        temporary_password_validity_days = 7
        minimum_length = 8
        require_lowercase = true
        require_numbers = true
        require_symbols = true
    }

    sign_in_policy {
        allowed_first_auth_factors = ["EMAIL_OTP", "PASSWORD", "WEB_AUTHN"]
    }

    # web_authn_configuration {
    # }


    mfa_configuration = "OFF"

    # software_token_mfa_configuration {
    #     enabled = true
    # }

    # email_mfa_configuration {
    #     message = "Your MFA verification code is {####}."
    #     subject = "Your MFA verification code"
    # }

    # account_recovery_setting {
    #     recovery_mechanism {
    #         name = "verified_email"
    #         priority = 1
    #     }
    # }

    auto_verified_attributes = ["email"]

    verification_message_template {
        email_subject = "Your verification code"
        email_message = "Your verification code is {####}."
        sms_message = "Your verification code is {####}."
    }

    email_configuration {
        source_arn = data.aws_ses_email_identity.ses.arn
        from_email_address = var.from_email_address
        email_sending_account = "DEVELOPER"
    }

    # FIXME SMSは未設定
    # sms_configuration {
    #     external_id = "usermgr-test"
    #     sns_caller_arn = aws_iam_role.sns.arn
    # }


    device_configuration {
        challenge_required_on_new_device = true
        device_only_remembered_on_user_prompt = true
    }
}

# ドメイン名を指定して、Cognitoのエンドポイントを作成
# サードパーティIdP認証等を行う場合は、このエンドポイントを利用する
resource "awscc_cognito_user_pool_domain" "pool_domain" {
    user_pool_id = aws_cognito_user_pool.user_pool.id
    domain = var.user_pool_domain
    managed_login_version = 2
}

# ユーザープールクライアントを作成
# このクライアントを利用して、ユーザー登録、認証等を行う
resource "awscc_cognito_user_pool_client" "pool_client" {
    user_pool_id = aws_cognito_user_pool.user_pool.id
    client_name = var.user_pool_client_name

    generate_secret = false
    prevent_user_existence_errors = "ENABLED"
    callback_ur_ls = ["http://localhost:8080"]
    logout_ur_ls = ["http://localhost:8080"]
    allowed_o_auth_flows = ["code"]
    allowed_o_auth_scopes = ["openid"]
    explicit_auth_flows = ["ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_PASSWORD_AUTH"]
    allowed_o_auth_flows_user_pool_client = true
    supported_identity_providers = ["COGNITO"]
}
