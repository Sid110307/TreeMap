import React from "react";
import { Image, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Google } from "iconoir-react-native";

import Button from "../../components/button";
import Text from "../../components/text";

import { useAuth } from "../../core/auth";
import colors from "../../core/colors";

export default () => {
	const { handleGoogleAuth, loading } = useAuth();
	return (
		<View style={{ flex: 1 }}>
			<LinearGradient
				colors={[colors.tint[0], colors.tint[300], colors.tint[500]]}
				locations={[0, 0.6, 1]}
				style={{
					flex: 1,
					alignItems: "center",
					backgroundColor: colors.light[0],
					justifyContent: "flex-end",
					paddingBottom: 40,
				}}
			>
				<StatusBar style="light" translucent />
				<View style={{ width: "100%", padding: 40, marginBottom: 200 }}>
					<Image
						resizeMode="contain"
						source={require("../../../assets/images/icon.png")}
						style={{
							width: 80,
							height: 80,
							left: -20,
							bottom: 20,
						}}
					/>
					<Text
						style={{
							fontFamily: "Light",
							fontSize: 32,
							color: colors.light[0],
						}}
					>
						Welcome to <Text style={{ fontFamily: "Title" }}>TreeMap</Text>
					</Text>
				</View>
				<Button
					onPress={async () => await handleGoogleAuth()}
					loading={loading}
					textComponent={
						<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
							<Google color={colors.primary} />
							<Text
								style={{
									fontFamily: "Medium",
									fontSize: 16,
									color: colors.primary,
									marginLeft: 10,
								}}
							>
								Sign in with Google
							</Text>
						</View>
					}
				/>
			</LinearGradient>
		</View>
	);
};
