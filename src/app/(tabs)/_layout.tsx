import { Image } from "react-native";

import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { InputField, Map, NavigatorAlt } from "iconoir-react-native";

import colors from "../../core/colors";
import { useUserState } from "../../core/state";

export default () => {
	const { user } = useUserState();
	return (
		<Tabs
			initialRouteName="input"
			screenOptions={{ tabBarActiveTintColor: colors.primary, headerShown: false }}
			screenListeners={{
				tabPress: async () => await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
			}}
		>
			<Tabs.Screen
				name="input"
				options={{
					title: "Input",
					tabBarIcon: ({ color }) => <InputField color={color} />,
				}}
			/>
			<Tabs.Screen
				name="nearby"
				options={{
					title: "Nearby",
					tabBarIcon: ({ color }) => <NavigatorAlt color={color} />,
				}}
			/>
			<Tabs.Screen
				name="map"
				options={{
					title: "Map",
					tabBarIcon: ({ color }) => <Map color={color} />,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color }) => (
						<Image
							source={{ uri: user.photo }}
							style={{
								width: 24,
								height: 24,
								borderRadius: 12,
								borderWidth: 1,
								borderColor: color,
							}}
						/>
					),
				}}
			/>
		</Tabs>
	);
};
