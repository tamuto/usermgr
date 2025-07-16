import React, { useState } from 'react';
import { SignFlowProvider, useSignUp, useAuthState } from '../src';

// サインアップフォームコンポーネント
function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { signUp, isLoading, error } = useSignUp();
  const { isAuthenticated } = useAuthState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    try {
      await signUp({
        email,
        password,
        attributes: {
          name,
          email,
        },
      });
      setIsSuccess(true);
    } catch (err) {
      // エラーはuseSignUpで管理
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <h2>既にサインイン済みです</h2>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div>
        <h2>サインアップ完了！</h2>
        <p>確認メールを {email} に送信しました。</p>
        <p>メール内のリンクをクリックしてアカウントを有効化してください。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>新規登録</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          エラー: {error.message}
        </div>
      )}
      
      <div>
        <label htmlFor="name">名前:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
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
          minLength={8}
        />
      </div>
      
      <div>
        <label htmlFor="confirmPassword">パスワード確認:</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={8}
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登録中...' : '新規登録'}
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
        <SignUpForm />
      </div>
    </SignFlowProvider>
  );
}

export default App;