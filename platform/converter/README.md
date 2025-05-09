# Cognito Managed Login Branding Converter

shadcn/uiのCSS変数から、AWS Cognito Managed Login Branding用のTerraformリソース定義を生成するツール。

## 概要

このツールは、shadcn/uiで定義された`global.css`からカラーテーマやスタイル情報を抽出し、AWS Cognitoの
マネージドログインフォームのカスタマイズ設定に変換します。変換結果はTerraformの
`awscc_cognito_managed_login_branding`リソース定義として出力されます。

## インストール

```bash
# 依存パッケージのインストール
npm install

# TypeScriptのコンパイル
npm run build
```

## 使用方法

### コマンドラインオプション

```
Usage: cognito-convert [options]

shadcn/ui global.cssをAWS Cognito Managed Login Brandingに変換します

Options:
  -V, --version             バージョン情報を表示
  -c, --css-file <path>     shadcn/ui global.cssファイルのパス
  -o, --output <path>       出力Terraformファイルのパス
  -u, --user-pool-id <id>   AWS Cognito User Pool ID
  -i, --client-id <id>      AWS Cognito Client ID
  -n, --resource-name <n>   Terraformリソース名 (default: "cognito_branding")
  -d, --use-defaults        CSS指定をせず、デフォルト値を使用する
  -h, --help                ヘルプを表示
```

### 基本的な使用例

```bash
# オプションを指定して実行
npx ts-node src/index.ts --css-file ./path/to/global.css --output ./cognito_branding.tf --user-pool-id us-east-1_abc123 --client-id 1a2b3c4d5e6f

# ビルド後に実行
npm run build
./bin/cognito-convert --css-file ./path/to/global.css --output ./cognito_branding.tf --user-pool-id us-east-1_abc123 --client-id 1a2b3c4d5e6f

# インタラクティブモード（プロンプトで入力）
./bin/cognito-convert
```

### デフォルト値の使用

CSSファイルが見つからない場合やCSS解析に失敗した場合、または`--use-defaults`オプションを指定した場合は、
shadcn/uiのデフォルトカラーテーマを使用して変換を行います。

```bash
./bin/cognito-convert --use-defaults --output ./cognito_branding.tf --user-pool-id us-east-1_abc123 --client-id 1a2b3c4d5e6f
```

## 設定項目

生成されるCognitoブランディング設定は以下のようなコンポーネントをカスタマイズします：

- ログインフォームの背景色
- 入力フィールドのスタイル
- ボタンのスタイル（プライマリ/セカンダリ）
- テキストカラー
- ボーダーカラー
- ダークモード/ライトモードの対応
- エラーステータスの表示スタイル

## Terraformでの使用例

生成されたTerraformファイルは以下のように使用します：

```terraform
provider "aws" {
  region = "us-east-1"
}

# マネージドログインを有効にしたCognitoドメイン設定
resource "awscc_cognito_user_pool_domain" "domain" {
  domain = "my-app-domain"
  user_pool_id = "us-east-1_abc123"
  # managed_login_version = 2 # マネージドログインの有効化（現在のAWSCCプロバイダでは未対応の可能性あり）
}

# 生成されたブランディング設定
resource "awscc_cognito_managed_login_branding" "cognito_branding" {
  user_pool_id = "us-east-1_abc123"
  client_id = "1a2b3c4d5e6f"
  # ... (生成された設定)
}
```

## 制限事項

- AWS Terraformプロバイダの`awscc_cognito_managed_login_branding`リソースがサポートしている必要があります。
- マネージドログインを有効にするには、ユーザープールドメインの`managed_login_version`を設定する必要がありますが、
  現在のTerraformプロバイダでは未対応の可能性があります。
