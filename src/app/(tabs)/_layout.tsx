import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { GridPlus, InputField, Map, NavigatorAlt } from "iconoir-react-native";

import colors from "../../core/colors";

export default () => (
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
			name="manage"
			options={{
				title: "Manage",
				tabBarIcon: ({ color }) => <GridPlus color={color} />,
			}}
		/>
	</Tabs>
);
