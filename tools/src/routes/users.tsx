import { createFileRoute } from "@tanstack/react-router";
import { UsersTable } from "../components/user-list";

export const Route = createFileRoute("/users")({
	component: UsersPage,
});

function UsersPage() {
	return (
		<div className="container mx-auto py-6">
			<h1 className="text-3xl font-bold mb-6">ユーザー管理</h1>
			<UsersTable />
		</div>
	);
}
