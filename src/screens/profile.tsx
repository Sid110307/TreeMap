import React from "react";
import { Alert, Image, View } from "react-native";
import Toast from "react-native-toast-message";

import { useRouter } from "expo-router";
import { UserXmark } from "iconoir-react-native";
import { DateTime } from "luxon";

import Option from "../components/option";
import Text, { HeadText, IncrementText } from "../components/text";

import colors from "../core/colors";
import { databaseManager } from "../core/database";
import { useUserState } from "../core/state";

export const ProfileCard = () => {
	const { user } = useUserState();
	return (
		<View
			style={{
				width: "100%",
				backgroundColor: colors.light[0],
				padding: 16,
				flexDirection: "row",
				alignItems: "flex-start",
				gap: 16,
			}}
		>
			<Image
				source={{ uri: user.photo }}
				style={{
					width: 100,
					height: 100,
					borderRadius: 50,
					borderWidth: 1,
					borderColor: colors.dark[200],
					backgroundColor: colors.dark[200],
				}}
			/>
			<View>
				<Text style={{ fontFamily: "Bold", fontSize: 24, color: colors.dark[500] }}>
					{user.username}
				</Text>
				<Text style={{ fontFamily: "Light", fontSize: 12, color: colors.dark[500] }}>
					{user.email}
				</Text>
				<Text style={{ marginTop: 8, color: colors.dark[500] }}>
					Member since{" "}
					{DateTime.fromISO(user.memberSince.replace(" ", "T"), {
						zone: "utc",
					})
						.toLocal()
						.toFormat("MMMM dd, yyyy")}
				</Text>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
					<Text style={{ color: colors.dark[500] }}>Identified trees:</Text>
					<IncrementText
						value={user.totalIdentified}
						style={{ fontFamily: "Bold", fontSize: 14, color: colors.primary }}
					/>
				</View>
			</View>
		</View>
	);
};

export const Options = () => {
	const router = useRouter();
	const { user, isLoggedIn } = useUserState();

	return (
		<View style={{ width: "100%", paddingVertical: 16, gap: 8 }}>
			<HeadText style={{ marginHorizontal: 8 }}>Options</HeadText>
			<Option type="external" text="My Trees" onPress={() => router.navigate("/myTrees")} />
			<Option
				component={<UserXmark color={colors.light[0]} width={16} height={16} />}
				color={colors.error}
				style={{ padding: 4 }}
				text="Request to delete account"
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
			/>
		</View>
	);
};
