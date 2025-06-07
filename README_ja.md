# ユーザー管理ツール・ライブラリ

## 概要

これは様々なネットワーク環境とセキュリティ要件に対応するよう設計された、AWS Cognitoユーザー管理のための包括的なライブラリとツール群です。

このプロジェクトは以下のコンポーネントを提供します：

- **Pythonライブラリ（usermgr）** - プロバイダーパターンを使用したコアユーザー管理ライブラリ
- **Lambda関数** - サーバーレス関数によるAWS Cognito操作
- **Terraform設定** - AWS Cognito設定のためのInfrastructure as Code
- **WebベーステストUI** - ユーザー管理テスト用のReactアプリケーション
- **管理ツール** - 本格運用対応のWebベース管理インターフェース
- **UIコンバーター** - shadcn/uiをAWS Cognitoブランディングに変換するツール

**プロジェクト状況**: 包括的なユーザーおよびグループ管理機能を備えた本格運用対応

## ネットワーク環境サポート

このプロジェクトは複数のネットワーク構成をサポートします：

### 1. **IPv6 + EGRESS_ONLY_INETGW（推奨）**
- IPv6接続による**Cognito API直接アクセス**
- Lambdaプロキシと比較して低レイテンシとコスト削減
- IPv6サポートを持つ最新のAWS環境に適している

### 2. **Lambdaプロキシ（レガシー/高セキュリティ）**
- 完全なネットワーク分離のための**Lambda媒介操作**
- 直接インターネットアクセスのないプライベートサブネットに必要
- 厳格な外部通信制限を持つ高セキュリティ環境に最適

### 3. **ハイブリッドアプローチ**
- 直接APIとLambdaプロキシ間のランタイム切り替え
- 環境変数またはファクトリーパラメーターで設定可能

## 各ツールとライブラリの説明

### usermgrライブラリ

- AWS Cognitoユーザー管理のための統一インターフェースを提供するPythonライブラリ
- 包括的なユーザーおよびグループ操作をサポート（CRUD、パスワード管理など）
- 拡張性のための抽象基底クラスを持つ**プロバイダーパターンアーキテクチャ**
- **デュアルアクセスモード**：
  - **直接API**: 直接AWS Cognito API呼び出し（IPv6対応）
  - **Lambdaプロキシ**: 分離環境用のLambda関数経由操作
- シングルトンパターンサポートを持つ環境ベース設定

#### インストール

- Cognito APIを直接操作する場合：

```bash
pip install usermgr[cognito]
```

- Lambda関数を介して操作する場合：

```bash
pip install usermgr[lambda]
```

#### 使用方法

```python
from usermgr.Factory import Factory

# オプション1: 環境ベースシングルトン（推奨）
um = Factory.get_usermgr()  # AWS_COGNITO環境変数を使用してプロバイダーを決定

# オプション2: Cognito直接操作（IPv6環境）
instance = Factory.get_instance(Factory.AWS_COGNITO, 
                               region='<AWS_REGION>', 
                               user_pool_id='<USER_POOL_ID>', 
                               client_id='<CLIENT_ID>', 
                               client_secret='<CLIENT_SECRET>')

# オプション3: Lambda操作（プライベートサブネット/高セキュリティ）
instance = Factory.get_instance(Factory.AWS_LAMBDA, 
                               function_name='<LAMBDA_FUNCTION_NAME>')

# ユーザー管理操作
instance.add_user('username', 'password', {
    'custom:extra_info': 'extra_info'
})

instance.update_user('username', {
    'custom:extra_info': 'updated_info'
})

instance.set_password('username', 'new_password', permanent=True)
instance.delete_user('username')

# ユーザークエリ
if instance.is_exist_user('username'):
    print('User exists')

user_info = instance.get_user('username')
users_list = instance.list_users()

# グループ管理
instance.add_group('groupname', 'description')
instance.add_user_to_group('username', 'groupname')
instance.remove_user_from_group('username', 'groupname')
instance.delete_group('groupname')

# 認証サポート
instance.authenticate_user('username', 'password')
```

- 利用可能な関数の詳細は `usermgr/base.py` を参照してください。

### Terraform設定

リポジトリには `platform/terraform` ディレクトリにAWS Cognitoユーザープールのセットアップに役立つTerraform設定ファイルが含まれています。これらの設定は以下を提供します：

- カスタマイズ可能な設定を持つCognitoユーザープール
- アプリケーション統合用のユーザープールクライアント
- 認証エンドポイント用のユーザープールドメイン
- マネージドログインブランディングサポート

これらの設定を使用するには、`platform/terraform` ディレクトリに移動し、`variables.tf` の変数を要件に合わせてカスタマイズしてください。

### Cognitoユーザー管理Lambda関数

- プライベートサブネットからLambda関数経由でCognitoを操作する場合に使用します。
- `platform/etc` フォルダーへ移動後、以下の手順に従ってください。

#### 1. 環境設定ファイルの作成

`platform/etc/.env` ファイルを以下の設定で作成してください：

| 項目 | 説明 | 例 |
| ---- | ----------- | ------- |
| AWS_ACCESS_KEY_ID | AWS アクセスキーID（AWS Profileを使用する場合は任意） | `AKIAIOSFODNN7EXAMPLE` |
| AWS_SECRET_ACCESS_KEY | AWS シークレットアクセスキー（AWS Profileを使用する場合は任意） | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| AWS_PROFILE | AWS CLIプロファイル名（推奨） | `default` |
| AWS_REGION | AWS リージョン | `ap-northeast-1` |
| ACCOUNT_ID | AWS アカウントID | `123456789012` |
| ROLE | Lambda関数用のIAMロール名 | `usermgr-lambda-role` |
| LAMBDA_NAME_USERMGR | ユーザー管理用Lambda関数名 | `usermgr` |
| LAMBDA_NAME_DOWNLOAD | JWKS ダウンロード用Lambda関数名 | `usermgr_download_jwks` |
| USERPOOL_ID | Cognitoユーザープール ID | `ap-northeast-1_xxxxxxxxx` |
| CLIENT_ID | Cognitoクライアント ID | `1234567890abcdefghijk` |
| SECRET | Cognitoクライアントシークレット | `abcdefghijklmnop1234567890` |

**セキュリティ注意事項**: 可能な場合はアクセスキーをハードコーディングする代わりにAWS ProfileまたはIAMロールを使用してください。

- 例（適宜、環境に合わせて修正してください）：

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

- etcフォルダーで以下のコマンドを実行してください：

```bash
dotenv run ./role/scripts/create_role.sh
```

#### 3. Lambda関数の登録

##### 3-1. ユーザー管理用Lambda関数の作成

- etcフォルダーで以下のコマンドを実行してください：

```bash
dotenv run ./usermgr/scripts/create_function.sh
```

既存の関数を更新する場合：

```bash
dotenv run ./usermgr/scripts/update_function.sh
```

##### 3-2. JWKS ダウンロード用Lambda関数の作成

- etcフォルダーで以下のコマンドを実行してください：
- この関数は、プライベートサブネットでCognitoのIDトークン検証を使用する際に必要です。

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

### WebベーステストUI

`testui`ディレクトリには、ユーザー管理操作のためのReactベーステストインターフェースが含まれています。以下の機能を提供します：

- Cognito認証のためのAWS Amplify統合
- 日本語サポート
- サインイン/サインアウト機能
- ユーザー管理テストインターフェース

セットアップと使用方法：

```bash
cd testui
pnpm install    # 依存関係をインストール
pnpm dev        # 開発サーバーを開始（ポート8080）
pnpm build      # 本番ビルド
```

**設定**: 環境変数または設定ファイルでCognito設定が必要です。

### 管理ツール

`tools`ディレクトリは、ReactとTanStack Routerで構築された包括的なWebベース管理インターフェースを提供します：

**機能**:
- **ユーザー管理**: 高度なユーザー作成フォームを持つ完全なCRUD操作
- **グループ管理**: グループの作成、削除、メンバーシップ管理
- **ユーザー一覧**: 高度な検索、フィルタリング、ソート機能
- **リアルタイム操作**: Cognito API統合によるライブ更新
- **日本語ローカライゼーション**: 完全な日本語UIサポート

**技術スタック**:
- TypeScriptとTailwind CSSを使用したReact
- ルーティング用TanStack Router
- 状態管理用Zustand
- shadcn/uiコンポーネントライブラリ
- Cognito操作用AWS SDK v3

セットアップと使用方法：

```bash
cd tools
pnpm install    # 依存関係をインストール
pnpm dev        # 開発サーバーを開始（ポート8080）
pnpm build      # 本番ビルド
```

**設定**: アプリケーション内の環境設定でAWS認証情報とCognito設定をセットアップしてください。

### UIコンバーター（platform/converter）

shadcn/uiコンポーネントをAWS Cognito Managed Loginブランディング形式に変換する本格運用対応ツール：

**機能**:
- shadcn/ui CSS変数をCognitoブランディングJSONに変換
- アルファチャンネルサポート付きOKLCHからHEX色変換
- ライト/ダークモードテーマサポート
- 自動Terraformリソース生成
- バッチ処理用CLIインターフェース

**使用方法**:
```bash
cd platform/converter
pnpm install       # 依存関係をインストール
pnpm build         # TypeScriptをJavaScriptにビルド
pnpm start         # コンバーターツールを実行

# CSSをCognitoブランディングに変換
npx cognito-convert --input globals.css --output cognito-branding.tf
```

**出力**: デプロイ準備完了のTerraform `awscc_cognito_managed_login_branding`リソースを生成します。

## 環境設定

### プロバイダー選択

ライブラリは環境変数に基づいて適切なプロバイダーを自動的に選択します：

```bash
# Cognito API直接アクセス用（IPv6環境）
export AWS_COGNITO=true

# Lambdaプロキシアクセス用（プライベートサブネット）
export AWS_LAMBDA=true
```

### テスト設定

テストを実行するには、以下の環境変数をセットアップしてください：

```bash
export AWS_REGION=ap-northeast-1
export USERPOOL_ID=your_user_pool_id
export CLIENT_ID=your_client_id
export SECRET=your_client_secret
export LAMBDA_FUNCTION_NAME=your_lambda_function_name
```

## トラブルシューティング

### よくある問題

1. **Factory.create()が動作しない**: `Factory.get_instance()`を使用してください（使用方法セクション参照）
2. **テストがスキップされる**: 上記の通り環境変数を設定してください
3. **IPv6接続**: VPCでEGRESS_ONLY_INETGWが適切に設定されていることを確認してください
4. **Lambdaタイムアウト**: ユーザー管理操作のタイムアウト設定を増加してください

## ユーザー管理ツール・ライブラリの削除方法

`platform/etc`ディレクトリから以下のステップに従ってください：

1. **Lambdaトリガーを削除** Cognito（もしあれば）から関数を削除する前に
2. **Lambda関数を削除**:
   ```bash
   dotenv run aws lambda delete-function --function-name usermgr
   dotenv run aws lambda delete-function --function-name usermgr_download_jwks
   ```
3. **IAMロールを削除**:
   ```bash
   dotenv run aws iam delete-role --role-name usermgr-lambda-role
   ```
4. **Terraformリソースをクリーンアップ**（使用している場合）:
   ```bash
   cd platform/terraform
   terraform destroy
   ```

関数とロール名は環境設定で指定したものに置き換えてください。