# ラムダ作成について

## 環境の設定

.envファイルを作成します。

```
AWS_PROFILE=***
AWS_REGION=***

ACCOUNT_ID=123456789012
ROLE=usermgr-lambda-role
```

### ラムダの作成

1. ロールの作成

以下のスクリプトだと、`AmazonCognitoPowerUser`のポリシーはアタッチされない。cognitoを操作するlambdaと共通のロールで問題なければlambda側のロールを使用する。

```
dotenv run ./scripts/create_role.sh
```

2. ラムダ関数の作成

```
dotenv run ./scripts/create_function.sh
```

* ラムダ関数の更新

```
dotenv run ./scripts/update_function.sh
```

### ラムダ関数の削除

```
dotenv run aws lambda delete-function --function-name usermgr_dl_jwks
```
