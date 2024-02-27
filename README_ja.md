# ユーザ管理用ツールおよびライブラリ

## 概要

ユーザを管理するためのツールとライブラリです。
以下の機能を提供します。

- Python向けusermgrライブラリ
- Cognitoユーザ管理用Lambda関数
- Cognitoユーザアクティビティ管理用DynamoDB定義およびLambda関数
- 【作成中】ユーザ管理用GUIツール

## 各種ツールおよびライブラリの説明

### usermgrライブラリ

- ユーザ管理用のPythonライブラリです。
- ユーザの追加、更新、削除、検索などの機能を提供します。
- 現時点ではAWS Cognitoに対応しています。
- 直接CognitoAPIを操作する方法と、Lambda関数を介して操作する方法の両方に対応しています。
  - プライベートサブネットからCognitoを直接操作できない場合にLambda関数を利用します。
- 将来的に他のユーザ管理サービスにも対応する予定です。その際にライブラリの構造はそのままで使えるようにする予定です。

#### インストール

- CognitoAPIを直接操作する場合

```bash
pip install usermgr[cognito]
```

- Lambda関数を介して操作する場合

```bash
pip install usermgr[lambda]
```

#### 使い方

```python
from usermgr import Factory

instance = Factory.create(Factory.AWS_COGNITO)  # Lambdaの場合はFactory.AWS_LAMBDA

instance.add_user('username', 'password', {
    'custom:extra_info': 'extra_info'
})
```

- 使える関数はusermgr/base.pyを参照してください。

### Cognitoユーザ管理用Lambda関数

- プライベートサブネットからLambda関数経由でCognitoを操作する場合に利用します。
- etcフォルダへ移動後に、以下の手順に従って登録を行ってください。

#### 1. 環境設定ファイルの作成

- etc/.envファイルを作成してください。
- 各設定値は以下の通りです。
  - なお、AWS_ACCESS_KEY_ID、AWS_SECRET_ACCESS_KEYおよびAWS_PROFILEは、aws cliのコンフィグファイルに合わせて設定してください。

| 項目                     | 説明                                       |
| ------------------------ | ------------------------------------------ |
| AWS_ACCESS_KEY_ID        | AWSのアクセスキー                          |
| AWS_SECRET_ACCESS_KEY    | AWSのシークレットアクセスキー              |
| AWS_PROFILE              | AWSのプロファイル                          |
| AWS_REGION               | AWSのリージョン                            |
| ACCOUNT_ID               | AWSのアカウントID                          |
| ROLE                     | ラムダ関数に付与するIAMロール名            |
| DYNAMODB_ACTIVITY_POLICY | ロールに付与するDynamoDBアクセスポリシー名 |
| DYNAMODB_NAME            | DynamoDBのテーブル名                       |
| LAMBDA_NAME_ACTIVITY     | ユーザアクティビティ管理用Lambda関数名     |
| LAMBDA_NAME_USERMGR      | ユーザ管理用Lambda関数名                   |
| LAMBDA_NAME_DOWNLOAD     | JWKSダウンロード用Lambda関数名             |
| USERPOOL_ID              | CognitoのユーザプールID                    |
| CLIENT_ID                | CognitoのクライアントID                    |
| SECRET                   | Cognitoのクライアントシークレット          |

- 参考(適宜、環境に合わせて修正してください)

```ini
AWS_PROFILE=xxxx
AWS_REGION=ap-northeast-1

ACCOUNT_ID=xxxxxx
ROLE=usermgr-lambda-role
DYNAMODB_ACTIVITY_POLICY=usermgr_activity_policy
DYNAMODB_NAME=usermgr_activity
LAMBDA_NAME_ACTIVITY=usermgr_activity
LAMBDA_NAME_USERMGR=usermgr
LAMBDA_NAME_DOWNLOAD=usermgr_download_jwks

USERPOOL_ID=ap-northeast-1_xxxxxx
CLIENT_ID=xxxxxx
SECRET=xxxxx
```

#### 2. IAMロールの作成

- 以下のスクリプトを実行してください。

```bash
dotenv run ./role/scripts/create_role.sh
```

#### 3. ラムダ関数の作成

##### 3-1. Cognitoユーザ管理用Lambda関数の作成

- 以下のスクリプトを実行してください。

```bash
dotenv run ./usermgr/scripts/create_function.sh
```

##### 3-2. Cognito JWKS取得用Lambda関数の作成

- 以下のスクリプトを実行してください。
- プライベートサブネットでCognitoのJWTを検証する時に必要になります。

```bash
dotenv run ./download_jwks/scripts/create_function.sh
```

- ./download_jwks/scripts/execute_function.shを参考に各プロジェクトにLambda実行を組み込んでください。

##### 3-3. Cognitoユーザアクティビティ管理用Lambda関数の作成

- 以下のスクリプトを実行してください。

```bash
dotenv run ./activity/scripts/create_dynamodb.sh
dotenv run ./activity/scripts/create_function.sh
```

- CognitoのLambdaトリガーでトークン生成前LambdaトリガーとしてLambda関数を登録してください。

## 削除方法

- 以下のコマンドを実行してください。
- CognitoからLambdaを参照しているのであれば、Lambda関数を削除する前にCognitoからLambdaトリガーを削除してください。
- 各名前は環境設定で指定したものに置き換えてください。

```bash
dotenv run aws lambda delete-function --function-name usermgr
dotenv run aws lambda delete-function --function-name usermgr_dl_jwks
dotenv run aws lambda delete-function --function-name usermgr_activity
dotenv run aws dynamodb delete-table --table-name usermgr_activity
dotenv run aws iam delete-role --role-name usermgr-lambda-role
dotenv run aws iam delete-policy --policy-name usermgr_activity_policy
```
