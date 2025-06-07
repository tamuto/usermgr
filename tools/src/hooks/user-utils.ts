import type {
	AttributeType,
	UserType,
} from "@aws-sdk/client-cognito-identity-provider";

export interface FormattedUser {
	username: string;
	status: string;
	enabled: boolean;
	createdAt: Date;
	updatedAt?: Date;
	email?: string;
	name?: string;
	phoneNumber?: string;
	attributes: Record<string, string>;
}

export const formatUserAttributes = (user: UserType): FormattedUser => {
	const attributesMap: Record<string, string> = {};
	let email: string | undefined;
	let name: string | undefined;
	let phoneNumber: string | undefined;

	if (user.Attributes) {
		for (const attr of user.Attributes) {
			if (attr.Name && attr.Value) {
				attributesMap[attr.Name] = attr.Value;

				if (attr.Name === "email") {
					email = attr.Value;
				} else if (attr.Name === "name") {
					name = attr.Value;
				} else if (attr.Name === "phone_number") {
					phoneNumber = attr.Value;
				}
			}
		}
	}

	return {
		username: user.Username || "Unknown",
		status: user.UserStatus || "UNKNOWN",
		enabled: user.Enabled !== undefined ? user.Enabled : false,
		createdAt: user.UserCreateDate || new Date(),
		updatedAt: user.UserLastModifiedDate,
		email,
		name,
		phoneNumber,
		attributes: attributesMap,
	};
};

export const formatUsersList = (users: UserType[]): FormattedUser[] => {
	return users.map(formatUserAttributes);
};

export const getStatusBadgeColor = (status: string): string => {
	switch (status) {
		case "CONFIRMED":
			return "bg-green-100 text-green-800";
		case "UNCONFIRMED":
			return "bg-yellow-100 text-yellow-800";
		case "ARCHIVED":
			return "bg-gray-100 text-gray-800";
		case "COMPROMISED":
			return "bg-red-100 text-red-800";
		case "UNKNOWN":
			return "bg-gray-100 text-gray-800";
		case "RESET_REQUIRED":
			return "bg-blue-100 text-blue-800";
		case "FORCE_CHANGE_PASSWORD":
			return "bg-purple-100 text-purple-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
};
