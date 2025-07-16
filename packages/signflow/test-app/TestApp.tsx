import React from 'react';
import { createRoot } from 'react-dom/client';
import { SignFlowProvider, useSignIn, useAuthState } from '../src';

// テスト用のCognito設定（実際の値に置き換えてください）
const testConfig = {
  provider: 'cognito' as const,
  region: 'ap-northeast-1',
  userPoolId: 'ap-northeast-1_XXXXXXXXX', // 実際のUser Pool IDに置き換え
  clientId: 'your-client-id', // 実際のClient IDに置き換え
  clientSecret: 'your-client-secret', // 必要に応じて
};

function TestSignIn() {
  const { signIn, signOut, isLoading, error } = useSignIn();
  const { isAuthenticated, user, status } = useAuthState();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn({ email, password });
    } catch (err) {
      console.error('Sign in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>認証成功！</h2>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
          margin: '20px 0'
        }}>
          <p><strong>ようこそ、{user.email}さん</strong></p>
          <p>ユーザーID: {user.id}</p>
          <p>ステータス: {status}</p>
          {user.attributes && (
            <div>
              <h3>属性:</h3>
              <pre>{JSON.stringify(user.attributes, null, 2)}</pre>
            </div>
          )}
        </div>
        <button onClick={handleSignOut}>サインアウト</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>SignFlow テスト</h2>
      <p>ステータス: {status}</p>
      
      {error && (
        <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          エラー: {error.message}
        </div>
      )}
      
      <form onSubmit={handleSignIn}>
        <div style={{ marginBottom: '15px' }}>
          <label>メールアドレス:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            disabled={isLoading}
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>パスワード:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            disabled={isLoading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'サインイン中...' : 'サインイン'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>テスト用認証情報:</p>
        <p>メール: test@example.com</p>
        <p>パスワード: password123</p>
        <p>※ 実際のCognitoを使用する場合は、設定を変更してください</p>
      </div>
    </div>
  );
}

function TestApp() {
  return (
    <SignFlowProvider config={testConfig}>
      <TestSignIn />
    </SignFlowProvider>
  );
}

// テストアプリの実行
if (typeof document !== 'undefined') {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<TestApp />);
  }
}

export default TestApp;