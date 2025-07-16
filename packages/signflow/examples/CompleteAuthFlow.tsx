import React, { useState } from 'react';
import { 
  SignFlowProvider, 
  useSignIn, 
  useSignUp, 
  usePasswordReset, 
  useAuthState, 
  useMFA 
} from '../src';

type FlowType = 'signin' | 'signup' | 'reset';

// 完全な認証フロー例
function CompleteAuthForm() {
  const [flowType, setFlowType] = useState<FlowType>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    mfaCode: '',
  });
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const { signIn, signOut, isLoading: signInLoading, error: signInError } = useSignIn();
  const { signUp, isLoading: signUpLoading, error: signUpError } = useSignUp();
  const { resetPassword, isLoading: resetLoading, error: resetError } = usePasswordReset();
  const { confirmMFA, isLoading: mfaLoading, error: mfaError } = useMFA();
  const { status, user, session } = useAuthState();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn({ 
      email: formData.email, 
      password: formData.password 
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        attributes: {
          name: formData.name,
          email: formData.email,
        },
      });
      setSignUpSuccess(true);
    } catch (err) {
      // エラーはuseSignUpで管理
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await resetPassword({ email: formData.email });
      setResetSuccess(true);
    } catch (err) {
      // エラーはusePasswordResetで管理
    }
  };

  const handleMFAConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (session) {
      await confirmMFA({
        challengeResponse: formData.mfaCode,
        session,
      });
    }
  };

  // 認証成功画面
  if (status === 'authenticated' && user) {
    return (
      <div>
        <h2>認証成功！</h2>
        <div style={{ padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
          <p><strong>ようこそ、{user.attributes.name || user.email}さん</strong></p>
          <p>ユーザーID: {user.id}</p>
          <p>メールアドレス: {user.email}</p>
          
          {user.attributes && (
            <div>
              <h3>ユーザー属性:</h3>
              <ul>
                {Object.entries(user.attributes).map(([key, value]) => (
                  <li key={key}>{key}: {value}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => signOut()}
          style={{ marginTop: '20px' }}
        >
          サインアウト
        </button>
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
            value={formData.mfaCode}
            onChange={(e) => handleInputChange('mfaCode', e.target.value)}
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

  // サインアップ成功画面
  if (signUpSuccess) {
    return (
      <div>
        <h2>サインアップ完了！</h2>
        <p>確認メールを {formData.email} に送信しました。</p>
        <p>メール内のリンクをクリックしてアカウントを有効化してください。</p>
        
        <button 
          onClick={() => {
            setSignUpSuccess(false);
            setFlowType('signin');
          }}
          style={{ marginTop: '20px' }}
        >
          サインイン画面へ
        </button>
      </div>
    );
  }

  // パスワードリセット成功画面
  if (resetSuccess) {
    return (
      <div>
        <h2>パスワードリセットメール送信完了</h2>
        <p>パスワードリセットのメールを {formData.email} に送信しました。</p>
        
        <button 
          onClick={() => {
            setResetSuccess(false);
            setFlowType('signin');
          }}
          style={{ marginTop: '20px' }}
        >
          サインイン画面へ
        </button>
      </div>
    );
  }

  // メイン認証フォーム
  return (
    <div>
      {/* フロータイプ選択 */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setFlowType('signin')}
          style={{ 
            marginRight: '10px', 
            backgroundColor: flowType === 'signin' ? '#007bff' : '#f8f9fa',
            color: flowType === 'signin' ? 'white' : 'black',
          }}
        >
          サインイン
        </button>
        <button 
          onClick={() => setFlowType('signup')}
          style={{ 
            marginRight: '10px', 
            backgroundColor: flowType === 'signup' ? '#007bff' : '#f8f9fa',
            color: flowType === 'signup' ? 'white' : 'black',
          }}
        >
          新規登録
        </button>
        <button 
          onClick={() => setFlowType('reset')}
          style={{ 
            backgroundColor: flowType === 'reset' ? '#007bff' : '#f8f9fa',
            color: flowType === 'reset' ? 'white' : 'black',
          }}
        >
          パスワードリセット
        </button>
      </div>

      {/* サインインフォーム */}
      {flowType === 'signin' && (
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
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={signInLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password">パスワード:</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              disabled={signInLoading}
            />
          </div>
          
          <button type="submit" disabled={signInLoading}>
            {signInLoading ? 'サインイン中...' : 'サインイン'}
          </button>
        </form>
      )}

      {/* サインアップフォーム */}
      {flowType === 'signup' && (
        <form onSubmit={handleSignUp}>
          <h2>新規登録</h2>
          
          {signUpError && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              エラー: {signUpError.message}
            </div>
          )}
          
          <div>
            <label htmlFor="name">名前:</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              disabled={signUpLoading}
            />
          </div>
          
          <div>
            <label htmlFor="email">メールアドレス:</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={signUpLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password">パスワード:</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              disabled={signUpLoading}
              minLength={8}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword">パスワード確認:</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              disabled={signUpLoading}
              minLength={8}
            />
          </div>
          
          <button type="submit" disabled={signUpLoading}>
            {signUpLoading ? '登録中...' : '新規登録'}
          </button>
        </form>
      )}

      {/* パスワードリセットフォーム */}
      {flowType === 'reset' && (
        <form onSubmit={handlePasswordReset}>
          <h2>パスワードリセット</h2>
          
          {resetError && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              エラー: {resetError.message}
            </div>
          )}
          
          <div>
            <label htmlFor="email">メールアドレス:</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={resetLoading}
            />
          </div>
          
          <button type="submit" disabled={resetLoading}>
            {resetLoading ? 'メール送信中...' : 'パスワードリセットメールを送信'}
          </button>
        </form>
      )}
    </div>
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
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <CompleteAuthForm />
      </div>
    </SignFlowProvider>
  );
}

export default App;