import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCognito } from "@/hooks/use-cognito";
import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

interface UserAttribute {
  key: string;
  value: string;
}

export function CreateUserForm() {
  const { client, userPoolId, isLoading } = useCognito();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    temporaryPassword: "",
    sendEmail: true
  });
  const [attributes, setAttributes] = useState<UserAttribute[]>([]);
  const [newAttribute, setNewAttribute] = useState({ key: "", value: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "ユーザー名は必須です";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスは必須です";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }
    
    if (!formData.temporaryPassword.trim()) {
      newErrors.temporaryPassword = "一時パスワードは必須です";
    } else if (formData.temporaryPassword.length < 8) {
      newErrors.temporaryPassword = "パスワードは8文字以上である必要があります";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!client || !userPoolId) {
      setErrors({ submit: "Cognito client not initialized" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // ユーザー属性を準備
      const userAttributes = [
        { Name: "email", Value: formData.email },
        { Name: "email_verified", Value: "true" },
        ...attributes.map(attr => ({ Name: attr.key, Value: attr.value }))
      ];
      
      // ユーザーを作成
      const createCommand = new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: formData.username,
        UserAttributes: userAttributes,
        TemporaryPassword: formData.temporaryPassword,
        MessageAction: formData.sendEmail ? "DELIVER" : "SUPPRESS"
      });
      
      await client.send(createCommand);
      
      // パスワードを永続化
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: formData.username,
        Password: formData.temporaryPassword,
        Permanent: false
      });
      
      await client.send(setPasswordCommand);
      
      // フォームをリセット
      setFormData({
        username: "",
        email: "",
        temporaryPassword: "",
        sendEmail: true
      });
      setAttributes([]);
      setErrors({});
      
      alert("ユーザーが正常に作成されました");
    } catch (error) {
      console.error("ユーザー作成エラー:", error);
      setErrors({ submit: `ユーザーの作成に失敗しました: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAttribute = () => {
    if (newAttribute.key && newAttribute.value) {
      // custom: プレフィックスを追加（必要に応じて）
      const key = newAttribute.key.startsWith('custom:') ? newAttribute.key : `custom:${newAttribute.key}`;
      setAttributes([...attributes, { key, value: newAttribute.value }]);
      setNewAttribute({ key: "", value: "" });
    }
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>新しいユーザーの作成</CardTitle>
        <CardDescription>
          Cognitoユーザープールに新しいユーザーを追加します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                ユーザー名 *
              </label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="user123"
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                メールアドレス *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                一時パスワード *
              </label>
              <Input
                id="password"
                type="password"
                value={formData.temporaryPassword}
                onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                placeholder="Temp123!"
                className={errors.temporaryPassword ? "border-red-500" : ""}
              />
              {errors.temporaryPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.temporaryPassword}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                ユーザーは初回ログイン時にパスワードの変更を求められます
              </p>
            </div>
          </div>

          {/* カスタム属性 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">カスタム属性</h3>
            
            <div className="flex gap-2">
              <Input
                placeholder="属性名 (例: department)"
                value={newAttribute.key}
                onChange={(e) => setNewAttribute({ ...newAttribute, key: e.target.value })}
              />
              <Input
                placeholder="値 (例: Engineering)"
                value={newAttribute.value}
                onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
              />
              <Button
                type="button"
                onClick={addAttribute}
                disabled={!newAttribute.key || !newAttribute.value}
                variant="outline"
              >
                追加
              </Button>
            </div>

            {attributes.length > 0 && (
              <div className="space-y-2">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {attr.key}: {attr.value}
                    </Badge>
                    <Button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      variant="ghost"
                      size="sm"
                    >
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* エラーメッセージ */}
          {errors.submit && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded border">
              {errors.submit}
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !client}
              className="flex-1"
            >
              {isSubmitting ? "作成中..." : "ユーザーを作成"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  username: "",
                  email: "",
                  temporaryPassword: "",
                  sendEmail: true
                });
                setAttributes([]);
                setErrors({});
              }}
            >
              リセット
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
