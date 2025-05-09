
resource "aws_cognito_user" "test1" {
    user_pool_id = aws_cognito_user_pool.user_pool.id
    username = "test1@in4.me"
    temporary_password =  "#test1234"

    attributes = {
        email = "test1@in4.me"
        email_verified = true
    }
}
