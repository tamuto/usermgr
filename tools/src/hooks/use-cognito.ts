import { create } from "zustand";
import {
	CognitoIdentityProviderClient,
	ListUsersCommand,
	AdminGetUserCommand,
	type UserType,
} from "@aws-sdk/client-cognito-identity-provider";

interface AwsConfig {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	userPoolId: string;
}

interface CognitoState {
	client: CognitoIdentityProviderClient | null;
	userPoolId: string | null;
	users: UserType[];
	isLoading: boolean;
	error: string | null;

	// Actions
	init: (config: AwsConfig) => void;
	fetchUsers: () => Promise<void>;
	getUserDetails: (username: string) => Promise<UserType | null>;
}

const useCognito = create<CognitoState>((set, get) => ({
	client: null,
	userPoolId: null,
	users: [],
	isLoading: false,
	error: null,

	init: (config) => {
		const client = new CognitoIdentityProviderClient([
			{
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
				region: config.region,
			},
		]);

		set({
			client,
			userPoolId: config.userPoolId,
		});
	},

	fetchUsers: async () => {
		const { client, userPoolId } = get();

		if (!client || !userPoolId) {
			set({ error: "Cognito client not initialized" });
			return;
		}

		set({ isLoading: true, error: null });

		try {
			const command = new ListUsersCommand({
				UserPoolId: userPoolId,
			});

			const response = await client.send(command);
			set({
				users: response.Users || [],
				isLoading: false,
			});
		} catch (error) {
			console.error("Error fetching users:", error);
			set({
				error: `Failed to fetch users: ${error instanceof Error ? error.message : String(error)}`,
				isLoading: false,
			});
		}
	},

	getUserDetails: async (username) => {
		const { client, userPoolId } = get();

		if (!client || !userPoolId) {
			set({ error: "Cognito client not initialized" });
			return null;
		}

		try {
			const command = new AdminGetUserCommand({
				UserPoolId: userPoolId,
				Username: username,
			});

			return await client.send(command);
		} catch (error) {
			console.error("Error fetching user details:", error);
			set({
				error: `Failed to fetch user details: ${error instanceof Error ? error.message : String(error)}`,
			});
			return null;
		}
	},
}));

export { useCognito };
