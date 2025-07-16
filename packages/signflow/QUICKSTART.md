# SignFlow - クイックスタートガイド

## インストール

```bash
npm install @infodb/signflow
# または
pnpm add @infodb/signflow
# または
yarn add @infodb/signflow
```

## 基本的な使用方法

### 1. プロバイダーの設定

```tsx
import { SignFlowProvider } from '@infodb/signflow';

function App() {
  const config = {
    provider: 'cognito',
    region: 'ap-northeast-1',
    userPoolId: 'ap-northeast-1_XXXXXXXXX',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret', // オプション
  };

  return (
    <SignFlowProvider config={config}>
      <YourAppContent />
    </SignFlowProvider>
  );
}
```

### 2. サインインフォーム

```tsx
import { useSignIn, useAuthState } from '@infodb/signflow';

function SignInForm() {
  const { signIn, isLoading, error } = useSignIn();
  const { isAuthenticated, user } = useAuthState();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn({ 
      email: 'user@example.com', 
      password: 'password123' 
    });
  };

  if (isAuthenticated) {
    return <div>ようこそ、{user.email}さん！</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>エラー: {error.message}</div>}
      <input type="email" placeholder="メールアドレス" required />
      <input type="password" placeholder="パスワード" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'サインイン中...' : 'サインイン'}
      </button>
    </form>
  );
}
```

### 3. 新規登録フォーム

```tsx
import { useSignUp } from '@infodb/signflow';

function SignUpForm() {
  const { signUp, isLoading, error } = useSignUp();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await signUp({
      email: 'newuser@example.com',
      password: 'password123',
      attributes: {
        name: 'New User',
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>エラー: {error.message}</div>}
      <input type="text" placeholder="名前" required />
      <input type="email" placeholder="メールアドレス" required />
      <input type="password" placeholder="パスワード" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登録中...' : '新規登録'}
      </button>
    </form>
  );
}
```

### 4. 認証状態の確認

```tsx
import { useAuthState } from '@infodb/signflow';

function UserProfile() {
  const { isAuthenticated, user, status } = useAuthState();
  
  if (status === 'loading') {
    return <div>読み込み中...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>ログインしてください</div>;
  }
  
  return (
    <div>
      <h2>ユーザープロフィール</h2>
      <p>ID: {user.id}</p>
      <p>メール: {user.email}</p>
      <p>名前: {user.attributes.name}</p>
    </div>
  );
}
```

## API リファレンス

### Hooks

- `useSignIn()` - サインイン機能
- `useSignUp()` - 新規登録機能  
- `usePasswordReset()` - パスワードリセット機能
- `useAuthState()` - 認証状態の取得
- `useMFA()` - 多要素認証機能

### 設定オプション

```typescript
interface SignFlowConfig {
  provider: 'cognito';
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret?: string;
}
```

### 認証状態

```typescript
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: SignFlowError | null;
}
```

## より多くの例

- [基本的なサインイン](./examples/BasicSignIn.tsx)
- [サインアップフロー](./examples/SignUpFlow.tsx)
- [MFA認証](./examples/MFAFlow.tsx)
- [パスワードリセット](./examples/PasswordResetFlow.tsx)
- [完全な認証フロー](./examples/CompleteAuthFlow.tsx)

## トラブルシューティング

### よくある問題

1. **「Provider not found」エラー**
   - `SignFlowProvider`でアプリケーションを囲んでいるか確認してください

2. **AWS Cognito接続エラー**
   - 設定値（region、userPoolId、clientId）が正しいか確認してください

3. **MFA認証が機能しない**
   - Cognito User Poolで MFA が有効になっているか確認してください

### サポート

問題が発生した場合は、GitHubのIssuesで報告してください。