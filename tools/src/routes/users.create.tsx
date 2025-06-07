import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users/create")({
	component: About,
});

function About() {
	return <div className="p-2">Hello from About!</div>;
}
