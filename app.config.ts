import { ConfigContext, ExpoConfig } from "expo/config";

require("dotenv").config();

const PID = "56e4653e-2c82-448a-9ceb-3e61e8f4997d";

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: "TreeMap",
	slug: "treemap",
	version: "2.0.0",
	orientation: "portrait",
	icon: "./assets/images/icon.png",
	scheme: "com.sid.treemap",
	updates: { url: `https://u.expo.dev/${PID}` },
	android: {
		adaptiveIcon: {
			foregroundImage: "./assets/images/adaptive-icon.png",
			backgroundColor: "#FFFFFF",
		},
	},
	plugins: [
		"expo-router",
		[
			"expo-splash-screen",
			{
				image: "./assets/images/splash-icon.png",
				imageWidth: 200,
				resizeMode: "contain",
				backgroundColor: "#FFFFFF",
			},
		],
		[
			"expo-build-properties",
			{
				android: {
					enableProguardInReleaseBuilds: true,
					enableShrinkResourcesInReleaseBuilds: true,
				},
			},
		],
	],
	experiments: { typedRoutes: true },
	extra: { eas: { projectId: PID } },
});
