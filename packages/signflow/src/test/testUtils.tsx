import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SignFlowProvider } from '../provider/SignFlowProvider';
import type { SignFlowConfig } from '../types';

// デフォルトのテスト設定
const defaultConfig: SignFlowConfig = {
  provider: 'cognito',
  region: 'us-east-1',
  userPoolId: 'us-east-1_testpool',
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
};

// カスタムレンダー関数
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  config?: Partial<SignFlowConfig>;
}

function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): ReturnType<typeof render> {
  const { config = {}, ...renderOptions } = options;
  const finalConfig = { ...defaultConfig, ...config };

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SignFlowProvider config={finalConfig}>
        {children}
      </SignFlowProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// テスト用のモックユーザー
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  attributes: {
    name: 'Test User',
    email: 'test@example.com',
  },
};

// テスト用のモックエラー
export const mockError = {
  code: 'TEST_ERROR',
  message: 'Test error message',
};

// すべてのテストユーティリティをエクスポート
export * from '@testing-library/react';
export { customRender as render };
export { defaultConfig };