import React, { useState } from 'react';
import { SignFlowProvider, useSignIn, useAuthState, useMFA } from '../src';

// MFA認証フロー例
function MFASignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  
  const { signIn, isLoading: signInLoading, error: signInError } = useSignIn();
  const { confirmMFA, isLoading: mfaLoading, error: mfaError } = useMFA();
  const { status, user, session } = useAuthState();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn({ email, password });
  };

  const handleMFAConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (session) {
      await confirmMFA({
        challengeResponse: mfaCode,
        session,
      });
    }
  };

  // 認証成功
  if (status === 'authenticated' && user) {
    return (
      <div>
        <h2>認証成功！</h2>
        <p>ようこそ、{user.email}さん</p>
        <p>ユーザーID: {user.id}</p>
      </div>
    );
  }

  // MFA認証画面
  if (status === 'mfa_required') {
    return (
      <form onSubmit={handleMFAConfirm}>
        <h2>二段階認証</h2>
        <p>認証アプリから6桁のコードを入力してください</p>
        
        {mfaError && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            エラー: {mfaError.message}
          </div>
        )}
        
        <div>
          <label htmlFor="mfaCode">認証コード:</label>
          <input
            id="mfaCode"
            type="text"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            maxLength={6}
            pattern="[0-9]{6}"
            required
            disabled={mfaLoading}
            style={{ textAlign: 'center', fontSize: '1.2em' }}
          />
        </div>
        
        <button type="submit" disabled={mfaLoading}>
          {mfaLoading ? '認証中...' : '認証する'}
        </button>
      </form>
    );
  }

  // 通常のサインイン画面
  return (
    <form onSubmit={handleSignIn}>
      <h2>サインイン</h2>
      
      {signInError && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          エラー: {signInError.message}
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
          disabled={signInLoading}
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
          disabled={signInLoading}
        />
      </div>
      
      <button type="submit" disabled={signInLoading}>
        {signInLoading ? 'サインイン中...' : 'サインイン'}
      </button>
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
        <MFASignInForm />
      </div>
    </SignFlowProvider>
  );
}

export default App;