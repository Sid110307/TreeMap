import React from "react";
import { Alert, View } from "react-native";
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

import { Options, ProfileCard } from "../../screens/profile";

export default () => {
	const router = useRouter();

	const [logoutLoading, setLogoutLoading] = React.useState(false);
	const [deleteLoading, setDeleteLoading] = React.useState(false);
	const { user, isLoggedIn, updateIsLoggedIn } = useUserState();

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
			<Options />
			<View
				style={{
					width: widthToDp("85%"),
					flexDirection: "row",
					alignItems: "center",
					gap: 16,
					marginTop: 16,
					marginBottom: 8,
				}}
			>
				<Button
					text="Logout"
					loading={logoutLoading}
					disabled={logoutLoading || !databaseManager.supabaseDB || !isLoggedIn}
					color={colors.error}
					style={{ flex: 1, marginVertical: 0 }}
					onPress={async () => {
						setLogoutLoading(true);
						try {
							await AsyncStorage.clear();
							await databaseManager.supabaseDB?.auth.signOut();
							await GoogleSignin.signOut();

							updateIsLoggedIn(false);
							setLogoutLoading(false);
							Toast.show({ type: "success", text1: "Successfully logged out!" });

							router.replace("/auth");
						} catch (error) {
							console.error(error);
							Toast.show({
								type: "error",
								text1: "Error logging out",
								text2: "Please try again later.",
							});

							setLogoutLoading(false);
							return;
						}
					}}
				/>
				<Button
					text="Delete local data"
					loading={deleteLoading}
					disabled={deleteLoading || !databaseManager.localDB || !isLoggedIn}
					color={colors.error}
					style={{ flex: 1, marginVertical: 0 }}
					onPress={async () => {
						Alert.alert(
							"Delete local data",
							"Are you sure you want to delete all local data? This will not affect your account or any data stored on the server.",
							[
								{ text: "Cancel", style: "cancel" },
								{
									text: "OK",
									style: "destructive",
									onPress: async () => {
										setDeleteLoading(true);
										await databaseManager.query(`DROP TABLE IF EXISTS TreeMap`);
										await databaseManager.init();

										setDeleteLoading(false);
										Toast.show({
											type: "success",
											text1: "Your local data has been deleted!",
										});
									},
								},
							],
						);
					}}
				/>
			</View>
			<Text
				style={{
					width: widthToDp("85%"),
					fontFamily: "Light",
					fontSize: 12,
					color: colors.primary,
					textDecorationLine: "underline",
				}}
				disabled={!isLoggedIn}
				onPress={async () => {
					Alert.alert(
						"Delete Account",
						"Are you sure you want to request account deletion?",
						[
							{ text: "Cancel", style: "cancel" },
							{
								text: "OK",
								style: "destructive",
								onPress: async () => {
									try {
										await databaseManager.supabaseDB
											?.from("DeleteRequests")
											.upsert(
												{
													user_id: user?.id,
													email: user?.email,
													created_at: new Date().toISOString(),
												},
												{ onConflict: "user_id" },
											)
											.throwOnError();
										Toast.show({
											type: "success",
											text1: "Account deletion requested!",
											text2: "We will process your request soon and delete your account.",
										});
									} catch (error) {
										console.error(error);
										Toast.show({
											type: "error",
											text1: "Error requesting account deletion",
											text2: "Please try again later.",
										});
									}
								},
							},
						],
					);
				}}
			>
				Request to delete account
			</Text>
		</View>
	);
};
