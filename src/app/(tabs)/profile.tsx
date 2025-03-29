import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";

import Button from "../../components/button";
import Text from "../../components/text";

import colors from "../../core/colors";
import { databaseManager } from "../../core/database";
import { useUserState } from "../../core/state";
import { widthToDp } from "../../core/utils";

import { ProfileCard } from "../../screens/profile";

export default () => {
	const router = useRouter();

	const [loading, setLoading] = React.useState(false);
	const { updateIsLoggedIn } = useUserState();

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "flex-end",
				alignItems: "center",
				marginVertical: 16,
			}}
		>
			<ProfileCard />
			<Button
				text="Logout"
				loading={loading}
				onPress={async () => {
					setLoading(true);
					await AsyncStorage.clear();
					await databaseManager.supabaseDB?.auth.signOut();
					await GoogleSignin.signOut();

					setLoading(false);
					updateIsLoggedIn(false);

					Toast.show({ type: "success", text1: "Successfully logged out!" });
					router.replace("/auth");
				}}
				color={colors.error}
				style={{ width: widthToDp("85%"), marginTop: 20, marginBottom: 8 }}
			/>
			<Text
				style={{
					width: widthToDp("85%"),
					fontFamily: "Light",
					textAlign: "justify",
					fontSize: 10,
					color: colors.dark[500],
				}}
			>
				Your offline/local data will remain in the app even after logging out. To delete
				your local data, please clear the app data from your device settings.
			</Text>
		</View>
	);
};
