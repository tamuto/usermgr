import React, { useState } from 'react';
import { SignFlowProvider, usePasswordReset, useAuthState } from '../src';

// パスワードリセットフロー例
function PasswordResetForm() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resetPassword, isLoading, error } = usePasswordReset();
  const { isAuthenticated } = useAuthState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await resetPassword({ email });
      setIsSuccess(true);
    } catch (err) {
      // エラーはusePasswordResetで管理
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <h2>既にサインイン済みです</h2>
        <p>パスワードリセットは必要ありません。</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div>
        <h2>パスワードリセットメール送信完了</h2>
        <p>
          パスワードリセットのメールを <strong>{email}</strong> に送信しました。
        </p>
        <p>
          メール内のリンクをクリックして、新しいパスワードを設定してください。
        </p>
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <h3>次のステップ:</h3>
          <ol>
            <li>受信したメールを確認</li>
            <li>メール内のリンクをクリック</li>
            <li>新しいパスワードを設定</li>
            <li>新しいパスワードでサインイン</li>
          </ol>
        </div>
        <button 
          onClick={() => {
            setIsSuccess(false);
            setEmail('');
          }}
          style={{ marginTop: '20px' }}
        >
          別のメールアドレスで再送信
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>パスワードリセット</h2>
      <p>
        登録したメールアドレスを入力してください。
        パスワードリセット用のリンクを送信します。
      </p>
      
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
          placeholder="your@example.com"
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'メール送信中...' : 'パスワードリセットメールを送信'}
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        <p>
          ※ メールが届かない場合は、迷惑メールフォルダもご確認ください
        </p>
      </div>
    </form>
  );
}

// アプリケーション
function App() {
  const config = {
    provider: 'cognito' as const,
    region: 'ap-northeast-1',
    userPoolId: 'ap-northeast-1_XXXXXXXXX',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
  };

  return (
    <SignFlowProvider config={config}>
      <div style={{ padding: '20px', maxWidth: '400px' }}>
        <PasswordResetForm />
      </div>
    </SignFlowProvider>
  );
}

export default App;