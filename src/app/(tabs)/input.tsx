import React from "react";
import { View } from "react-native";

import { useRouter } from "expo-router";

import Card from "../../components/card";

import { Actions, CoordinatesCard } from "../../screens/input";

export default () => {
	const router = useRouter();
	return (
		<View style={{ padding: 8, paddingHorizontal: 16 }}>
			{__DEV__ && (
				<Card title="Access sitemap" onPress={() => router.navigate("/_sitemap")} />
			)}
			<CoordinatesCard />
			<Actions />
		</View>
	);
};
