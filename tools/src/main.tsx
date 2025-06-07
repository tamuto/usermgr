import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider, createRouter } from "@tanstack/react-router";

import { useCognito } from "@/hooks/use-cognito";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import "./globals.css";

import awsConfig from "./environ.json";

useCognito.getState().init(awsConfig);

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);

console.log("AWS Config:", awsConfig);
