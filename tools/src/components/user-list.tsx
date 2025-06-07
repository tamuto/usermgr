import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	formatUsersList,
	getStatusBadgeColor,
	type FormattedUser,
} from "@/hooks/user-utils";
import { useCognito } from "@/hooks/use-cognito";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, RefreshCw } from "lucide-react";
import { format } from "date-fns";

/**
 * ユーザー一覧テーブルコンポーネント
 */
export function UsersTable() {
	const { users, isLoading, error, fetchUsers } = useCognito();
	const [sortField, setSortField] = useState<keyof FormattedUser>("username");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	// Format the raw user data from Cognito
	const formattedUsers = formatUsersList(users);

	// Handle sorting
	const handleSort = (field: keyof FormattedUser) => {
		if (field === sortField) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	// Sort the users
	const sortedUsers = [...formattedUsers].sort((a, b) => {
		const aValue = a[sortField];
		const bValue = b[sortField];

		if (aValue === undefined) return sortDirection === "asc" ? -1 : 1;
		if (bValue === undefined) return sortDirection === "asc" ? 1 : -1;

		if (aValue instanceof Date && bValue instanceof Date) {
			return sortDirection === "asc"
				? aValue.getTime() - bValue.getTime()
				: bValue.getTime() - aValue.getTime();
		}

		// String comparison
		const aString = String(aValue).toLowerCase();
		const bString = String(bValue).toLowerCase();
		return sortDirection === "asc"
			? aString.localeCompare(bString)
			: bString.localeCompare(aString);
	});

	const refreshUsers = () => {
		fetchUsers();
	};

	// Render functions
	const renderSortIndicator = (field: keyof FormattedUser) => {
		if (field !== sortField) return null;
		return sortDirection === "asc" ? " ↑" : " ↓";
	};

	const renderDate = (date?: Date) => {
		if (!date) return "—";
		return format(date, "yyyy-MM-dd HH:mm");
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>ユーザー一覧</CardTitle>
				<Button
					onClick={refreshUsers}
					disabled={isLoading}
					variant="outline"
					size="sm"
				>
					<RefreshCw
						className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
					/>
					{isLoading ? "読み込み中..." : "更新"}
				</Button>
			</CardHeader>
			<CardContent>
				{error ? (
					<div className="p-4 bg-red-50 text-red-800 rounded-md">
						<h3 className="font-semibold">
							ユーザー一覧の読み込みに失敗しました
						</h3>
						<p>{error}</p>
						<Button
							onClick={refreshUsers}
							variant="outline"
							className="mt-2"
							size="sm"
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							再試行
						</Button>
					</div>
				) : isLoading && users.length === 0 ? (
					<div className="flex justify-center items-center p-8">
						<RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHeader
									className="cursor-pointer"
									onClick={() => handleSort("username")}
								>
									ユーザー名{renderSortIndicator("username")}
								</TableHeader>
								<TableHeader
									className="cursor-pointer"
									onClick={() => handleSort("email")}
								>
									メールアドレス{renderSortIndicator("email")}
								</TableHeader>
								<TableHeader
									className="cursor-pointer"
									onClick={() => handleSort("status")}
								>
									ステータス{renderSortIndicator("status")}
								</TableHeader>
								<TableHeader
									className="cursor-pointer"
									onClick={() => handleSort("createdAt")}
								>
									作成日時{renderSortIndicator("createdAt")}
								</TableHeader>
								<TableHeader
									className="cursor-pointer"
									onClick={() => handleSort("updatedAt")}
								>
									更新日時{renderSortIndicator("updatedAt")}
								</TableHeader>
								<TableHeader className="w-10" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedUsers.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center py-8 text-gray-500"
									>
										ユーザーが見つかりません
									</TableCell>
								</TableRow>
							) : (
								sortedUsers.map((user) => (
									<TableRow key={user.username}>
										<TableCell className="font-medium">
											{user.username}
										</TableCell>
										<TableCell>{user.email || "—"}</TableCell>
										<TableCell>
											<Badge className={`${getStatusBadgeColor(user.status)}`}>
												{user.status}
											</Badge>
										</TableCell>
										<TableCell>{renderDate(user.createdAt)}</TableCell>
										<TableCell>{renderDate(user.updatedAt)}</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<span className="sr-only">メニューを開く</span>
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>アクション</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<DropdownMenuItem>詳細を表示</DropdownMenuItem>
													<DropdownMenuItem>編集</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem className="text-red-600">
														削除
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
