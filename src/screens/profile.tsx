import React from "react";
import { Image, View } from "react-native";

import { DateTime } from "luxon";

import Text, { IncrementText } from "../components/text";

import colors from "../core/colors";
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
				<Text style={{ fontFamily: "Light", fontSize: 12, color: colors.dark[500] }}>
					User ID: {user.id}
				</Text>
				<Text style={{ marginTop: 12, color: colors.dark[500] }}>
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
