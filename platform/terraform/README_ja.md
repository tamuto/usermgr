# Terraformファイル群

## Cognito

- CognitoをTerraformで管理するためのファイル
- 

```
dotenv run terraform -chdir=cognito apply -auto-approve
```

### ブランディングの更新

- 一度、ブランディングした定義を削除してから、terraform applyを実行する必要がある

```
dotenv run terraform -chdir=cognito destroy \
  -target=awscc_cognito_managed_login_branding.brand
```

## ブランディングの設定状態を確認する

```
aws --profile *** cognito-idp describe-managed-login-branding \
 --user-pool-id "***" \
 --managed-login-branding-id "****" \
 --return-merged-resources | jq . >| output.json
```
