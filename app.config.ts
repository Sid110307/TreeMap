import { ConfigContext, ExpoConfig } from "expo/config";

require("dotenv").config();

const PID = "56e4653e-2c82-448a-9ceb-3e61e8f4997d";

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: "TreeMap",
	slug: "treemap",
	owner: "sid110307",
	description: "A Geospatial Tree Mapping Tool for Environmental Research",
	version: "2.0.0",
	orientation: "portrait",
	icon: "./assets/images/icon.png",
	scheme: "com.sid.treemap",
	runtimeVersion: "2.0.0",
	updates: { url: `https://u.expo.dev/${PID}` },
	ios: {
		bundleIdentifier: "com.sid.treemap",
	},
	android: {
		package: "com.sid.treemap",
		adaptiveIcon: {
			foregroundImage: "./assets/images/icon.png",
			backgroundColor: "#3D89DA",
		},
	},
	plugins: [
		"expo-router",
		[
			"expo-splash-screen",
			{
				image: "./assets/images/icon.png",
				imageWidth: 200,
				resizeMode: "contain",
				backgroundColor: "#3D89DA",
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
		[
			"@react-native-google-signin/google-signin",
			{
				iosUrlScheme:
					"com.googleusercontent.apps.1099367355723-vj98fh5unekmrn1s0dm0vhe62nd8na3h",
			},
		],
	],
	experiments: { typedRoutes: true },
	extra: { eas: { projectId: PID } },
});
