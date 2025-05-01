import {
	fetchAuthSession,
	fetchUserAttributes,
	signInWithRedirect,
	signOut,
} from "aws-amplify/auth";
import { useEffect, useState } from "react";

export default function App() {
	const [username, setUsername] = useState<string | null>("");
	useEffect(() => {
		console.log("App mounted");
		(async () => {
			const session = await fetchAuthSession();
			console.log("Session: ", session);
			if (session.tokens === undefined) {
				signInWithRedirect({
					options: {
						lang: "ja",
					},
				});
			} else {
				// const user = await fetchUserAttributes();
				// console.log("User: ", user);
				// setUsername(user.username);
				setUsername(session.tokens.idToken?.payload.email);
			}
		})();
	}, []);

	const signIn = async () => {
		console.log("Sign in");
		signInWithRedirect({
			options: {
				lang: "ja",
			},
		});
	};

	const signOutHandler = async () => {
		console.log("Sign out");
		signOut();
	};

	return (
		<div className="p-5">
			<h1 className="text-3xl font-bold underline text-red-400">
				Hello world! {username}
			</h1>
			<button type="button" onClick={() => signIn()}>
				Sign in
			</button>
			<button type="button" onClick={() => signOutHandler()}>
				Sign out
			</button>
		</div>
	);
}
