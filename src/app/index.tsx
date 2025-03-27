import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import colors from "../../assets/colors";

import { useOnStartup } from "../utils/app";

export default function Index() {
	const { loading, onStartup } = useOnStartup();

	React.useEffect(() => {
		onStartup()
			.then(() => console.log("onStartup done"))
			.catch(console.error);
	}, []);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			{loading ? (
				<ActivityIndicator size="large" color={colors.primary} />
			) : (
				<Text>Edit app/index.tsx to edit this screen.</Text>
			)}
		</View>
	);
}
