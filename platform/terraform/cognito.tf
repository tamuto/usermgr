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

resource "awscc_cognito_managed_login_branding" "example" {
    user_pool_id = aws_cognito_user_pool.user_pool.id
    client_id    = split("|", awscc_cognito_user_pool_client.pool_client.id)[1]

    # Note: Settings format depends on the specific Cognito UI version you're using
    settings = jsonencode({})

    # assets = [{
    #     category   = "PAGE_HEADER_LOGO"
    #     extension  = "PNG"
    #     bytes      = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGNzdGMTE3NDA3MjA2ODExOEMxNEE3NkIxRDhEMzU5RSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpBQzU0OTI2RjY5MjAxMUUyQjM1OUE4QzQwMEM2QjM0MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpBQzU0OTI2RTY5MjAxMUUyQjM1OUE4QzQwMEM2QjM0MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjA1ODAxMTc0MDcyMDY4MTE4QzE0QTc2QjFEOEQzNTlFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkY3N0YxMTc0MDcyMDY4MTE4QzE0QTc2QjFEOEQzNTlFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+SG1RYgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAADqSURBVHjaYmRmYaSN4GVkYKKxASxMtDWAlYW2BrCy0tYANjbaGsDORlsDeNhpawAvO20N4OOgrQF8XLQ1gJ+btgYI8dLWAGFe2hogykdbA8T4aGuAOB9tDZDgo60BUvy0NUCWn7YGSAvQ1gAZAdoaICtIWwPkBGlrgIIQbQ1QFqatAWrCtDVAU4S2BmiJ0tYAHVHaGqArSlsDDMVpa4CROG0NMBanrQFmUrQ1wFKKtgbYStHWADsp2hrgJEVbA1ylqG0AP1MDCwsLjdMGAwM9i0pmNnoVlexspL0RebhobQAvUwAAAgwA3q4UUqwxJWsAAAAASUVORK5CYII="
    #     color_mode = "LIGHT"
    # }]
}
