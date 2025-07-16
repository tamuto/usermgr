# SignFlow - 開発ガイド

## 開発環境のセットアップ

### 必要な環境
- Node.js 18.0 以上
- pnpm 8.0 以上

### 依存関係のインストール
```bash
pnpm install
```

## 動作確認方法

### 1. 基本的な動作確認

```bash
# 全体チェック（型チェック + ビルド + テスト）
pnpm check

# 個別実行
pnpm typecheck  # TypeScript型チェック
pnpm build      # ライブラリビルド
pnpm test:run   # テスト実行（一回だけ）
pnpm test       # テストウォッチモード
```

### 2. 手動テストスクリプト

対話的なテストメニューを使用：

```bash
pnpm test:manual
```

または直接指定：

```bash
node scripts/test-manual.js 1  # 単体テスト
node scripts/test-manual.js 2  # ビルドテスト  
node scripts/test-manual.js 3  # 型チェック
node scripts/test-manual.js 4  # 全てのテスト
node scripts/test-manual.js 5  # HTMLテストページを開く
```

### 3. HTMLテストページ

ブラウザで動作確認：

```bash
# HTMLテストページを開く
open test-app/index.html
# または
pnpm test:manual 5
```

テストページの機能：
- モック認証でのサインイン・サインアップ・パスワードリセット
- UIの動作確認
- エラーハンドリングの確認

### 4. 実際のCognitoを使った動作確認

#### 4.1 Cognito設定の準備

AWS Cognitoで以下を設定：

```javascript
const config = {
  provider: 'cognito',
  region: 'ap-northeast-1',           // AWSリージョン
  userPoolId: 'ap-northeast-1_XXXXX', // User Pool ID
  clientId: 'your-client-id',         // App Client ID
  clientSecret: 'your-client-secret', // App Client Secret（オプション）
};
```

#### 4.2 テストアプリの実行

1. `test-app/TestApp.tsx`の設定を実際のCognito値に変更
2. 実際のユーザーでテスト

### 5. 他のプロジェクトでの使用テスト

#### 5.1 ローカルインストール

```bash
# 他のプロジェクトから
npm install file:/path/to/signflow
```

#### 5.2 npmパッケージとして公開前テスト

```bash
# パッケージファイルを作成
pnpm pack

# 生成された.tgzファイルを他のプロジェクトでインストール
npm install /path/to/infodb-signflow-0.1.0.tgz
```

## テスト

### 単体テスト

```bash
# ウォッチモード
pnpm test

# 一回だけ実行
pnpm test:run

# UIモード
pnpm test:ui
```

### テストファイル構成

```
src/
├── hooks/
│   ├── __tests__/
│   │   ├── useAuthState.test.ts
│   │   ├── useSignIn.test.tsx
│   │   └── simple.test.ts
├── providers/
│   └── __tests__/
│       └── CognitoAuthProvider.test.ts
├── store/
│   └── __tests__/
│       └── authStore.test.ts
└── test/
    ├── setup.ts      # テストセットアップ
    └── testUtils.tsx # テストユーティリティ
```

### テストカバレッジ

```bash
# カバレッジ付きテスト実行
pnpm test --coverage
```

## ビルド

### 開発ビルド

```bash
# ウォッチモード
pnpm dev

# 一回だけビルド
pnpm build
```

### ビルド成果物

```
dist/
├── index.js      # CommonJS
├── index.mjs     # ES Modules
├── index.d.ts    # TypeScript型定義
└── *.map         # ソースマップ
```

## リンティング

```bash
# ESLint実行
pnpm lint

# 自動修正
pnpm lint --fix
```

## デバッグ

### 1. ログの確認

Zustandのdevtoolsを使用：

```javascript
// ブラウザの開発者ツールでRedux DevToolsを使用可能
```

### 2. TypeScriptエラーの確認

```bash
# 型エラーの詳細確認
pnpm typecheck
```

### 3. ビルドエラーの確認

```bash
# ビルドの詳細ログ
pnpm build --verbose
```

## トラブルシューティング

### よくある問題

#### 1. テストが失敗する

```bash
# キャッシュをクリア
pnpm test --clearCache

# 依存関係を再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. ビルドが失敗する

```bash
# 型チェック単体で確認
pnpm typecheck

# 段階的にビルド
pnpm build --verbose
```

#### 3. AWS SDK関連のエラー

```bash
# AWS SDK の型定義を確認
pnpm add -D @types/aws-sdk
```

#### 4. React関連のエラー

```bash
# React の型定義を確認
pnpm add -D @types/react @types/react-dom
```

## 開発ワークフロー

### 1. 新機能の開発

```bash
# 1. 開発開始
pnpm dev

# 2. テストを書く
# src/hooks/__tests__/newFeature.test.ts

# 3. 実装
# src/hooks/newFeature.ts

# 4. テスト確認
pnpm test

# 5. ビルド確認
pnpm build

# 6. 全体チェック
pnpm check
```

### 2. バグ修正

```bash
# 1. 問題の再現テストを作成
# 2. 修正を実装
# 3. テストが通ることを確認
pnpm test:run

# 4. 全体チェック
pnpm check
```

## 公開準備

### 1. バージョン更新

```bash
# package.json のバージョンを更新
# "version": "0.1.1"
```

### 2. 最終チェック

```bash
# 全てのチェックを実行
pnpm check

# ビルド成果物を確認
pnpm build
ls -la dist/
```

### 3. パッケージング

```bash
# パッケージファイルを作成
pnpm pack

# 内容を確認
tar -tzf infodb-signflow-*.tgz
```

## 参考リンク

- [AWS Cognito JavaScript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Vitest Documentation](https://vitest.dev/)
- [tsup Documentation](https://tsup.egoist.dev/)
- [TypeScript React Documentation](https://www.typescriptlang.org/docs/handbook/react.html)