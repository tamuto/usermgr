import React, { useState } from 'react';
import { SignFlowProvider, useSignIn, useAuthState } from '../src';

// 基本的なサインインコンポーネント
function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signOut, isLoading, error } = useSignIn();
  const { isAuthenticated, user } = useAuthState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn({ email, password });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isAuthenticated && user) {
    return (
      <div>
        <h2>ようこそ、{user.email}さん！</h2>
        <p>ユーザーID: {user.id}</p>
        <button onClick={handleSignOut} disabled={isLoading}>
          {isLoading ? 'サインアウト中...' : 'サインアウト'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>サインイン</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          エラー: {error.message}
        </div>
      )}
      
      <div>
        <label htmlFor="email">メールアドレス:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="password">パスワード:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'サインイン中...' : 'サインイン'}
      </button>
    </form>
  );
}

// アプリケーションのルート
function App() {
  const config = {
    provider: 'cognito' as const,
    region: 'ap-northeast-1',
    userPoolId: 'ap-northeast-1_XXXXXXXXX',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret', // オプション
  };

  return (
    <SignFlowProvider config={config}>
      <div style={{ padding: '20px', maxWidth: '400px' }}>
        <SignInForm />
      </div>
    </SignFlowProvider>
  );
}

export default App;