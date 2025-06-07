import { createRootRoute, Outlet } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createRootRoute({
	component: () => (
		<SidebarProvider>
			<AppSidebar />
			<main className="overflow-auto p-6">
				<SidebarTrigger />
				<Outlet />
				{/* <TanStackRouterDevtools /> */}
			</main>
		</SidebarProvider>
	),
});
