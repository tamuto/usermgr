# ユーザ管理用ツールおよびライブラリ

## 概要

ユーザを管理するためのツールとライブラリです。
以下の機能を提供します：

- Python向けusermgrライブラリ
- AWS Cognitoユーザ管理用Lambda関数
- AWS Cognito設定用Terraformファイル
- ユーザ管理用Webベーステスト用UI
- ユーザ管理用コマンドラインツール

## 各種ツールおよびライブラリの説明

### usermgrライブラリ

- ユーザ管理用のPythonライブラリです。
- ユーザの追加、更新、削除、検索などの機能およびグループ管理機能を提供します。
- 現時点ではAWS Cognitoに対応しています。
- 直接CognitoAPIを操作する方法と、Lambda関数を介して操作する方法の両方に対応しています。
  - プライベートサブネットからCognitoを直接操作できない場合にLambda関数を利用します。
- 将来的に他のユーザ管理サービスにも対応する予定です。ライブラリは抽象基底クラスで設計されており、同じインターフェースで異なるプロバイダーを実装できるようになっています。

#### インストール

- CognitoAPIを直接操作する場合：

```bash
pip install usermgr[cognito]
```

- Lambda関数を介して操作する場合：

```bash
pip install usermgr[lambda]
```

#### 使い方

```python
from usermgr import Factory

# Cognitoを直接操作する場合
instance = Factory.create(Factory.AWS_COGNITO, 
                         region='<AWS_REGION>', 
                         user_pool_id='<USER_POOL_ID>', 
                         client_id='<CLIENT_ID>', 
                         client_secret='<CLIENT_SECRET>')

# Lambda経由で操作する場合
instance = Factory.create(Factory.AWS_LAMBDA, 
                         function_name='<LAMBDA_FUNCTION_NAME>')

# ユーザを追加
instance.add_user('username', 'password', {
    'custom:extra_info': 'extra_info'
})

# ユーザ属性を更新
instance.update_user('username', {
    'custom:extra_info': 'updated_info'
})

# パスワードを設定
instance.set_password('username', 'new_password', permanent=True)

# ユーザを削除
instance.delete_user('username')

# ユーザが存在するか確認
if instance.is_exist_user('username'):
    print('ユーザが存在します')

# ユーザをグループに追加
instance.add_user_to_group('username', 'groupname')

# グループを作成
instance.add_group('groupname', 'description')

# グループを削除
instance.delete_group('groupname')
```

- 利用可能な関数の詳細は `usermgr/base.py` を参照してください。

### Terraformの設定

リポジトリには `platform/terraform` ディレクトリにAWS Cognitoユーザプールのセットアップに役立つTerraform設定ファイルが含まれています。これらの設定は以下を提供します：

- カスタマイズ可能な設定を持つCognitoユーザプール
- アプリケーション連携用のユーザプールクライアント
- 認証エンドポイント用のユーザプールドメイン
- マネージドログインブランディングのサポート

これらの設定を使用するには、`platform/terraform` ディレクトリに移動し、`variables.tf` の変数を要件に合わせてカスタマイズしてください。

### Cognitoユーザ管理用Lambda関数

- プライベートサブネットからLambda関数経由でCognitoを操作する場合に利用します。
- `platform/etc` フォルダへ移動後に、以下の手順に従って登録を行ってください。

#### 1. 環境設定ファイルの作成

- `platform/etc/.env` ファイルを作成してください。
- 各設定値は以下の通りです：
  - AWS_ACCESS_KEY_ID、AWS_SECRET_ACCESS_KEYおよびAWS_PROFILEは、aws cliのコンフィグファイルに合わせて設定してください。

| 項目                     | 説明                                       |
| ------------------------ | ------------------------------------------ |
| AWS_ACCESS_KEY_ID        | AWSのアクセスキー                          |
| AWS_SECRET_ACCESS_KEY    | AWSのシークレットアクセスキー              |
| AWS_PROFILE              | AWSのプロファイル                          |
| AWS_REGION               | AWSのリージョン                            |
| ACCOUNT_ID               | AWSのアカウントID                          |
| ROLE                     | ラムダ関数に付与するIAMロール名            |
| LAMBDA_NAME_USERMGR      | ユーザ管理用Lambda関数名                   |
| LAMBDA_NAME_DOWNLOAD     | JWKSダウンロード用Lambda関数名             |
| USERPOOL_ID              | CognitoのユーザプールID                    |
| CLIENT_ID                | CognitoのクライアントID                    |
| SECRET                   | Cognitoのクライアントシークレット          |

- 参考(適宜、環境に合わせて修正してください)：

```ini
AWS_PROFILE=xxxx
AWS_REGION=ap-northeast-1

ACCOUNT_ID=xxxxxx
ROLE=usermgr-lambda-role
LAMBDA_NAME_USERMGR=usermgr
LAMBDA_NAME_DOWNLOAD=usermgr_download_jwks

USERPOOL_ID=ap-northeast-1_xxxxxx
CLIENT_ID=xxxxxx
SECRET=xxxxx
```

#### 2. IAMロールの作成

- 以下のスクリプトを実行してください：

```bash
dotenv run ./role/scripts/create_role.sh
```

#### 3. ラムダ関数の作成

##### 3-1. Cognitoユーザ管理用Lambda関数の作成

- 以下のスクリプトを実行してください：

```bash
dotenv run ./usermgr/scripts/create_function.sh
```

既存の関数を更新する場合：

```bash
dotenv run ./usermgr/scripts/update_function.sh
```

##### 3-2. Cognito JWKS取得用Lambda関数の作成

- 以下のスクリプトを実行してください：
- プライベートサブネットでCognitoのJWTを検証する時に必要になります。

```bash
dotenv run ./download_jwks/scripts/create_function.sh
```

既存の関数を更新する場合：

```bash
dotenv run ./download_jwks/scripts/update_function.sh
```

関数を実行する場合：

```bash
dotenv run ./download_jwks/scripts/execute_function.sh
```

### Webベーステスト用UI

リポジトリには `testui` ディレクトリにユーザ管理用のWebベーステストUIが含まれています。このUIはReactで構築されており、ユーザ管理機能をテストするために使用できます。

セットアップ：

```bash
cd testui
npm install
```

開発サーバーの起動：

```bash
npm run dev
```

プロダクション用ビルド：

```bash
npm run build
```

### コマンドラインツール

リポジトリには `tools` ディレクトリにユーザ管理用のコマンドラインツールが含まれています。これらのツールはBunで構築されています。

セットアップ：

```bash
cd tools
bun install
```

実行：

```bash
bun run index.ts
```

## 削除方法

- 以下のコマンドを実行してください。
- CognitoからLambdaを参照しているのであれば、Lambda関数を削除する前にCognitoからLambdaトリガーを削除してください。
- 各名前は環境設定で指定したものに置き換えてください。

```bash
dotenv run aws lambda delete-function --function-name usermgr
dotenv run aws lambda delete-function --function-name usermgr_dl_jwks
dotenv run aws iam delete-role --role-name usermgr-lambda-role
```
