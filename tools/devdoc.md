# ユーザー管理ツール - 開発者ドキュメント

## プロジェクト概要

ユーザー管理ツールは、AWS Cognitoユーザーの管理を改善するために設計されたReact/TypeScriptアプリケーションです。AWSコンソールのCognitoインターフェースには使いやすさの制限があるため、このツールはユーザー管理タスクのためのより直感的で効率的なインターフェースを提供することを目指しています。

## システムアーキテクチャ

プロジェクトは以下の主要コンポーネントから構成されています：

1. **フロントエンドアプリケーション**：ShadcnUIコンポーネントで構築されたReact/TypeScriptのWebアプリケーションで、Cognitoユーザーを管理するためのユーザーフレンドリーなインターフェースを提供します。

2. **AWS SDK統合**：AWS SDK for JavaScript (v3)との直接統合により、AWS Cognito Admin APIとやり取りします。

3. **設定システム**：ツール起動時にAWS認証情報とCognito設定を入力・保存するメカニズム。

## プロジェクト構造

リポジトリは以下の主要ディレクトリに編成されています：

```
/workspaces/usermgr/tools/
├── src/                # ソースコード
│   ├── components/     # Reactコンポーネント
│   │   └── ui/         # ShadcnUIコンポーネント
│   ├── hooks/          # フック
│   ├── lib/            # ユーティリティ関数
│   ├── services/       # AWSサービス統合
│   ├── config/         # 設定管理
│   ├── routes/         # アプリケーションルート
│   ├── globals.css     # グローバルスタイル
│   └── main.tsx        # アプリケーションエントリポイント
├── components.json     # ShadcnUI設定
├── package.json        # 依存関係
└── ...                 # その他の設定ファイル
```

## 技術スタック

### フロントエンド
- **React 19**: モダンUIライブラリ
- **TypeScript**: 型安全なJavaScript
- **TanStack Router**: 型安全なルーティング
- **ShadcnUI**: Tailwind CSSベースのコンポーネントライブラリ
- **Tailwind CSS**: ユーティリティファーストCSSフレームワーク
- **Rsbuild**: ビルドツール

### AWS SDK
- **AWS SDK for JavaScript (v3)**: Cognito APIとの直接統合用
- **CognitoIdentityProviderClient**: Cognitoユーザープール操作用クライアント

## コア機能

ユーザー管理ツールは、以下のインターフェースを提供する必要があります：

1. **設定管理**:
   - AWS認証情報の入力と保存
   - Cognitoユーザープール設定

2. **ユーザー管理**:
   - ユーザーの作成、読取、更新、削除
   - パスワードの設定とリセット
   - ユーザー属性の管理
   - ユーザーのステータスとアクティビティの表示

3. **グループ管理**:
   - グループの作成と削除
   - グループへのユーザーの追加/削除
   - グループ権限の管理

## 実装すべき主要コンポーネント

プロジェクト構造に基づいて、以下のコンポーネントを実装する必要があります：

### 1. 設定セットアップ

AWS設定を管理するためのコンポーネント：

- AWS認証情報入力フォーム
- Cognitoユーザープール設定フォーム
- 設定の保存と取得

### 2. ユーザー管理インターフェース

ユーザーを管理するためのコンポーネント：

- ユーザーリストビュー
- ユーザー作成フォーム
- ユーザー詳細ビューと編集
- パスワード管理

### 3. グループ管理インターフェース

グループを管理するためのコンポーネント：

- グループリストビュー
- グループ作成フォーム
- グループメンバーシップ管理

### 4. AWS SDKサービスレイヤー

Cognito Admin APIとやり取りするためのサービスを作成：

```typescript
// 例: /src/services/cognito-service.ts
import { 
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  ListUsersCommand
  // 他に必要なコマンド
} from "@aws-sdk/client-cognito-identity-provider";

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;

  constructor(credentials: any, region: string, userPoolId: string) {
    this.client = new CognitoIdentityProviderClient({
      credentials,
      region
    });
    this.userPoolId = userPoolId;
  }

  async listUsers() {
    const command = new ListUsersCommand({
      UserPoolId: this.userPoolId
    });
    
    try {
      const response = await this.client.send(command);
      return response.Users;
    } catch (error) {
      console.error("ユーザーリスト取得エラー:", error);
      throw error;
    }
  }

  // ユーザーとグループ管理のための他のメソッド
}
```

## 実装ガイド

### ステップ1: 設定管理のセットアップ

AWS設定を入力・保存するシステムを作成：

1. 以下を収集する設定フォームを作成：
   - AWS Access Key ID
   - AWS Secret Access Key
   - AWSリージョン
   - Cognito User Pool ID
   - Cognito App Client ID

2. 認証情報の安全な保存を実装（セッションストレージなど）

3. これらの認証情報でAWS SDKを初期化するサービスを作成

### ステップ2: AWS SDKサービスの実装

Cognito Admin APIとやり取りするサービスを作成：

1. 以下のメソッドを持つユーザー管理サービス：
   - ユーザーの一覧表示
   - ユーザーの作成
   - ユーザー詳細の取得
   - ユーザー属性の更新
   - ユーザーの削除
   - パスワード管理

2. 以下のメソッドを持つグループ管理サービス：
   - グループの一覧表示
   - グループの作成
   - グループへのユーザーの追加/削除

### ステップ3: UIコンポーネントの実装

必要なUIコンポーネントを作成：

1. ユーザー管理画面
2. グループ管理画面
3. 設定画面

### ステップ4: テストと反復

実際のCognitoユーザープールでアプリケーションをテストし、実装を反復改善する。

## 開発ワークフロー

1. **開発環境のセットアップ**:
   ```bash
   npm install
   npm run dev
   ```

2. **コード編成**:
   - 関連するコンポーネントを専用フォルダにグループ化
   - 型安全性のためにTypeScriptインターフェースを使用
   - 一貫したUIのためにShadcnUIコンポーネントを適用

3. **本番用ビルド**:
   ```bash
   npm run build
   ```

## 重要な注意点

1. **段階的な開発**: アプリケーションは一度に1画面ずつ構築し、各ステップで機能を確認します。

2. **ルーティング設定**: TanStack Routerによるルーティング設定については、フレームワークが自動機能や特定の設定要件を持っている可能性があるため、実装前にプロジェクトチームに確認してください。

3. **AWS SDKの使用**: AWS SDKを使用する際は、バンドルサイズを最小限に抑えるために、個々のインポートを使用するモダンなモジュラーアプローチ（v3）を使用してください。

4. **確認と検証**: 実装の詳細や機能が複雑であると思われる場合は、仮定を立てるのではなく、プロジェクトチームに確認を求めてください。

5. **自動化機能**: 一部の機能はフレームワークやライブラリによって自動的に処理される場合があります。これらの機能を手動で実装する前にプロジェクトチームに確認してください。

## Cognito Admin API

ユーザー管理ツールは、以下のAWS SDK v3 Cognito APIを使用します：

### ユーザー管理
- **ListUsersCommand**: ユーザープール内のユーザーを一覧表示
- **AdminCreateUserCommand**: 新しいユーザーを作成
- **AdminGetUserCommand**: ユーザー詳細を取得
- **AdminUpdateUserAttributesCommand**: ユーザー属性を更新
- **AdminDeleteUserCommand**: ユーザーを削除
- **AdminSetUserPasswordCommand**: ユーザーパスワードを設定

### グループ管理
- **ListGroupsCommand**: ユーザープール内のグループを一覧表示
- **CreateGroupCommand**: 新しいグループを作成
- **DeleteGroupCommand**: グループを削除
- **AdminAddUserToGroupCommand**: ユーザーをグループに追加
- **AdminRemoveUserFromGroupCommand**: ユーザーをグループから削除
- **ListUsersInGroupCommand**: グループ内のユーザーを一覧表示

## 次のステップ

1. 設定管理UIの実装
2. ユーザーリストと管理UIの実装
3. グループ管理UIの実装
4. 包括的なエラー処理の実装
5. 属性編集機能を持つユーザー詳細ビューの作成
6. パスワード管理機能の実装
7. グループメンバーシップ管理の追加

## 結論

このユーザー管理ツールは、より直感的で効率的なユーザー管理方法を提供することで、AWSコンソールのCognitoインターフェースの制限に対処します。AWS Cognito Admin APIと直接統合することで、柔軟性とセキュリティを維持しながら、ユーザー管理タスクのための包括的なソリューションを提供します。
