import {
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
	LayoutDashboard,
	Users,
	UserPlus,
	Group,
	Settings,
	LogOut,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

/**
 * メインサイドバーコンポーネント
 * AWS Cognitoユーザー管理ツールのナビゲーションを提供します
 */
export function AppSidebar() {
	return (
		<>
			<Sidebar>
				<SidebarHeader>
					<div className="flex items-center justify-between">
						<h1 className="text-lg font-semibold">ユーザー管理ツール</h1>
					</div>
				</SidebarHeader>

				<SidebarContent>
					<SidebarMenu>
						{/* ダッシュボード */}
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="ダッシュボード">
								<Link to="/">
									<LayoutDashboard />
									<span>ダッシュボード</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* ユーザー管理 */}
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="ユーザー一覧">
								<Link to="/users">
									<Users />
									<span>ユーザー一覧</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* ユーザー作成 */}
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="ユーザー作成">
								<Link to="/users/create">
									<UserPlus />
									<span>ユーザー作成</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* グループ管理 */}
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="グループ管理">
								<Link to="/groups">
									<Group />
									<span>グループ管理</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* 設定 */}
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="設定">
								<Link to="/settings">
									<Settings />
									<span>設定</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarContent>

				<SidebarFooter>
					<Button variant="ghost" className="w-full justify-start gap-2">
						<LogOut size={16} />
						<span>ログアウト</span>
					</Button>
				</SidebarFooter>
			</Sidebar>
		</>
	);
}
