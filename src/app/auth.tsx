import React from "react";
import { Image, StatusBar, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Google } from "iconoir-react-native";

import Button from "../components/button";
import Text from "../components/text";

import { useAuth } from "../core/auth";
import colors from "../core/colors";

export default () => {
	const { handleGoogleAuth, loading } = useAuth();
	return (
		<LinearGradient
			colors={[colors.tint[0], colors.tint[300], colors.dark[500]]}
			style={{
				flex: 1,
				alignItems: "center",
				backgroundColor: colors.light[0],
				justifyContent: "space-between",
				paddingHorizontal: 40,
			}}
		>
			<View style={{ width: "100%", marginTop: StatusBar.currentHeight, marginBottom: 128 }}>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<View
						style={{
							flex: 1,
							height: 1,
							backgroundColor: colors.dark[100],
						}}
					/>
					<Image
						resizeMode="contain"
						source={require("../../assets/images/icon.png")}
						style={{
							width: 100,
							height: 100,
							alignSelf: "center",
							marginBottom: 16,
						}}
					/>
					<View
						style={{
							flex: 1,
							height: 1,
							backgroundColor: colors.dark[100],
						}}
					/>
				</View>
				<Text
					style={{
						fontSize: 28,
						color: colors.light[0],
					}}
				>
					Welcome to
				</Text>
				<Text style={{ fontFamily: "Title", fontSize: 44, color: colors.primary }}>
					TreeMap
				</Text>
			</View>
			<Button
				onPress={async () => await handleGoogleAuth()}
				loading={loading}
				color={colors.primary}
				textComponent={
					<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
						<Google color={colors.light[0]} />
						<Text
							style={{
								fontFamily: "Medium",
								fontSize: 16,
								color: colors.light[0],
								marginLeft: 10,
							}}
						>
							Join with Google
						</Text>
					</View>
				}
			/>
		</LinearGradient>
	);
};
