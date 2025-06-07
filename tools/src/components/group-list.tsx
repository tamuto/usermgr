import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCognito } from "@/hooks/use-cognito";
import {
  ListGroupsCommand,
  CreateGroupCommand,
  DeleteGroupCommand,
  ListUsersInGroupCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  type GroupType,
} from "@aws-sdk/client-cognito-identity-provider";

interface GroupMember {
  Username: string;
  Attributes?: Array<{ Name: string; Value: string }>;
}

export function GroupsTable() {
  const { client, userPoolId, users, isLoading } = useCognito();
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [groupMembers, setGroupMembers] = useState<Record<string, GroupMember[]>>({});
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // グループ一覧を取得
  const fetchGroups = async () => {
    if (!client || !userPoolId) return;

    setIsLoadingGroups(true);
    try {
      const command = new ListGroupsCommand({
        UserPoolId: userPoolId,
      });
      const response = await client.send(command);
      setGroups(response.Groups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setErrors({ fetch: `グループの取得に失敗しました: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // グループメンバーを取得
  const fetchGroupMembers = async (groupName: string) => {
    if (!client || !userPoolId) return;

    try {
      const command = new ListUsersInGroupCommand({
        UserPoolId: userPoolId,
        GroupName: groupName,
      });
      const response = await client.send(command);
      setGroupMembers(prev => ({
        ...prev,
        [groupName]: response.Users || []
      }));
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };

  // グループを作成
  const createGroup = async () => {
    if (!client || !userPoolId) return;
    if (!newGroup.name.trim()) {
      setErrors({ create: "グループ名は必須です" });
      return;
    }

    try {
      const command = new CreateGroupCommand({
        UserPoolId: userPoolId,
        GroupName: newGroup.name,
        Description: newGroup.description || undefined,
      });
      await client.send(command);
      
      setNewGroup({ name: "", description: "" });
      setIsCreateDialogOpen(false);
      setErrors({});
      fetchGroups(); // グループ一覧を再取得
    } catch (error) {
      console.error("Error creating group:", error);
      setErrors({ create: `グループの作成に失敗しました: ${error instanceof Error ? error.message : String(error)}` });
    }
  };

  // グループを削除
  const deleteGroup = async (groupName: string) => {
    if (!client || !userPoolId) return;
    if (!confirm(`グループ "${groupName}" を削除しますか？`)) return;

    try {
      const command = new DeleteGroupCommand({
        UserPoolId: userPoolId,
        GroupName: groupName,
      });
      await client.send(command);
      fetchGroups(); // グループ一覧を再取得
    } catch (error) {
      console.error("Error deleting group:", error);
      setErrors({ delete: `グループの削除に失敗しました: ${error instanceof Error ? error.message : String(error)}` });
    }
  };

  // ユーザーをグループに追加
  const addUserToGroup = async (username: string, groupName: string) => {
    if (!client || !userPoolId) return;

    try {
      const command = new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: groupName,
      });
      await client.send(command);
      fetchGroupMembers(groupName); // メンバー一覧を再取得
    } catch (error) {
      console.error("Error adding user to group:", error);
      setErrors({ member: `ユーザーの追加に失敗しました: ${error instanceof Error ? error.message : String(error)}` });
    }
  };

  // ユーザーをグループから削除
  const removeUserFromGroup = async (username: string, groupName: string) => {
    if (!client || !userPoolId) return;

    try {
      const command = new AdminRemoveUserFromGroupCommand({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: groupName,
      });
      await client.send(command);
      fetchGroupMembers(groupName); // メンバー一覧を再取得
    } catch (error) {
      console.error("Error removing user from group:", error);
      setErrors({ member: `ユーザーの削除に失敗しました: ${error instanceof Error ? error.message : String(error)}` });
    }
  };

  useEffect(() => {
    if (client && userPoolId) {
      fetchGroups();
    }
  }, [client, userPoolId]);

  const openManageMembers = (groupName: string) => {
    setSelectedGroup(groupName);
    setIsManageMembersOpen(true);
    fetchGroupMembers(groupName);
  };

  const currentGroupMembers = selectedGroup ? groupMembers[selectedGroup] || [] : [];
  const availableUsers = users.filter(user => 
    !currentGroupMembers.some(member => member.Username === user.Username)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>グループ管理</CardTitle>
              <CardDescription>
                Cognitoユーザープールのグループを管理します
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>新しいグループ</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新しいグループの作成</DialogTitle>
                  <DialogDescription>
                    新しいグループを作成します
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="groupName" className="block text-sm font-medium mb-2">
                      グループ名 *
                    </label>
                    <Input
                      id="groupName"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <label htmlFor="groupDescription" className="block text-sm font-medium mb-2">
                      説明
                    </label>
                    <Input
                      id="groupDescription"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="管理者グループ"
                    />
                  </div>
                  {errors.create && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded border">
                      {errors.create}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={createGroup} className="flex-1">
                      作成
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      キャンセル
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingGroups ? (
            <p>グループを読み込み中...</p>
          ) : groups.length === 0 ? (
            <p className="text-gray-500">グループが見つかりませんでした</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>グループ名</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>作成日時</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.GroupName}>
                    <TableCell className="font-medium">{group.GroupName}</TableCell>
                    <TableCell>{group.Description || "-"}</TableCell>
                    <TableCell>
                      {group.CreationDate ? new Date(group.CreationDate).toLocaleString('ja-JP') : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openManageMembers(group.GroupName!)}
                        >
                          メンバー管理
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteGroup(group.GroupName!)}
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {errors.fetch && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded border mt-4">
              {errors.fetch}
            </div>
          )}
          {errors.delete && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded border mt-4">
              {errors.delete}
            </div>
          )}
        </CardContent>
      </Card>

      {/* メンバー管理ダイアログ */}
      <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>グループメンバー管理: {selectedGroup}</DialogTitle>
            <DialogDescription>
              グループのメンバーを追加・削除できます
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6">
            {/* 現在のメンバー */}
            <div>
              <h3 className="text-lg font-medium mb-3">現在のメンバー</h3>
              {currentGroupMembers.length === 0 ? (
                <p className="text-gray-500">メンバーがいません</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {currentGroupMembers.map((member) => (
                    <div key={member.Username} className="flex items-center justify-between p-2 border rounded">
                      <span>{member.Username}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUserFromGroup(member.Username!, selectedGroup!)}
                      >
                        削除
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 追加可能なユーザー */}
            <div>
              <h3 className="text-lg font-medium mb-3">追加可能なユーザー</h3>
              {availableUsers.length === 0 ? (
                <p className="text-gray-500">追加可能なユーザーがいません</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <div key={user.Username} className="flex items-center justify-between p-2 border rounded">
                      <span>{user.Username}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addUserToGroup(user.Username!, selectedGroup!)}
                      >
                        追加
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {errors.member && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded border">
              {errors.member}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
