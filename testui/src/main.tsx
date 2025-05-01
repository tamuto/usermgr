import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { CookieStorage } from "aws-amplify/utils";

import App from "@/app/App";
import "./globals.css";

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolId: "ap-northeast-1_NPWyfJNAy",
			userPoolClientId: "2tnpuri0f79k4e7jgrepflpl6s",
			loginWith: {
				oauth: {
					domain: "usermgr-test.auth.ap-northeast-1.amazoncognito.com",
					scopes: ["openid"],
					redirectSignIn: ["http://localhost:8080"],
					redirectSignOut: ["http://localhost:8080"],
					responseType: "code",
				},
			},
		},
	},
});
cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
