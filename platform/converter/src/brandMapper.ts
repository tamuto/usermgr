import { merge } from "lodash";
import type { CssVariables } from "./types";
import { error } from "node:console";

function applyButton(data: CssVariables) {
	const button = {
		components: {
			primaryButton: {
				lightMode: {
					hover: {
						backgroundColor: data.light.popover,
						textColor: data.light.popoverForeground,
					},
					defaults: {
						backgroundColor: data.light.primary,
						textColor: data.light.primaryForeground,
					},
					active: {
						backgroundColor: data.light.primary,
						textColor: data.light.primaryForeground,
					},
					disabled: {
						backgroundColor: data.light.muted,
						borderColor: data.light.border,
					},
				},
				darkMode: {
					hover: {
						backgroundColor: data.dark.popover,
						textColor: data.dark.popoverForeground,
					},
					defaults: {
						backgroundColor: data.dark.primary,
						textColor: data.dark.primaryForeground,
					},
					active: {
						backgroundColor: data.dark.primary,
						textColor: data.dark.primaryForeground,
					},
					disabled: {
						backgroundColor: data.dark.muted,
						borderColor: data.dark.border,
					},
				},
			},
			secondaryButton: {
				lightMode: {
					hover: {
						backgroundColor: data.light.popover,
						borderColor: data.light.border,
						textColor: data.light.popoverForeground,
					},
					defaults: {
						backgroundColor: data.light.secondary,
						borderColor: data.light.border,
						textColor: data.light.secondaryForeground,
					},
					active: {
						backgroundColor: data.light.secondary,
						borderColor: data.light.border,
						textColor: data.light.secondaryForeground,
					},
				},
				darkMode: {
					hover: {
						backgroundColor: data.dark.popover,
						borderColor: data.dark.border,
						textColor: data.dark.popoverForeground,
					},
					defaults: {
						backgroundColor: data.dark.secondary,
						borderColor: data.dark.border,
						textColor: data.dark.secondaryForeground,
					},
					active: {
						backgroundColor: data.dark.secondary,
						borderColor: data.dark.border,
						textColor: data.dark.secondaryForeground,
					},
				},
			},
		},
		componentClasses: {
			buttons: {
				borderRadius: data.light.radius,
			},
		},
	};
	return button;
}

function applyDivider(data: CssVariables) {
	const divider = {
		componentClasses: {
			divider: {
				lightMode: {
					borderColor: data.light.border,
				},
				darkMode: {
					borderColor: data.dark.border,
				},
			},
		},
	};
	return divider;
}

function applyFocusState(data: CssVariables) {
	const focus = {
		componentClasses: {
			focusState: {
				lightMode: {
					borderColor: data.light.ring,
				},
				darkMode: {
					borderColor: data.dark.ring,
				},
			},
		},
	};
	return focus;
}

function applyForm(data: CssVariables) {
	const form = {
		components: {
			form: {
				lightMode: {
					backgroundColor: data.light.card,
					borderColor: data.light.border,
				},
				borderRadius: data.light.radius,
				darkMode: {
					backgroundColor: data.dark.card,
					borderColor: data.dark.border,
				},
			},
		},
	};
	return form;
}

function applyStatusIndicator(data: CssVariables) {
	const statusIndicator = {
		components: {
			alert: {
				borderRadius: data.light.radius,
			},
		},
		componentClasses: {
			statusIndicator: {
				lightMode: {
					success: {
						backgroundColor: data.light.success,
						borderColor: data.light.success,
						indicatorColor: data.light.success,
					},
					pending: {
						indicatorColor: data.light.pending,
					},
					error: {
						backgroundColor: data.light.danger,
						borderColor: data.light.danger,
						indicatorColor: data.light.danger,
					},
				},
				darkMode: {
					success: {
						backgroundColor: data.dark.success,
						borderColor: data.dark.success,
						indicatorColor: data.dark.success,
					},
					pending: {
						indicatorColor: data.dark.pending,
					},
					error: {
						backgroundColor: data.dark.danger,
						borderColor: data.dark.danger,
						indicatorColor: data.dark.danger,
					},
				},
			},
		},
	};
	return statusIndicator;
}

function toSettings(data: CssVariables) {
	const settings = merge(
		{},
		applyButton(data),
		applyDivider(data),
		applyFocusState(data),
		applyForm(data),
		applyStatusIndicator(data),
	);
	return settings;
}

export { toSettings };
