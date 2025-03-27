import { Tabs } from "expo-router";
import { GridPlus, InputField, Map, NavigatorAlt } from "iconoir-react-native";

import colors from "../../../assets/colors";

export default () => (
	<Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerShown: false }}>
		<Tabs.Screen
			name="input/index"
			options={{
				title: "Input",
				tabBarIcon: ({ color }) => <InputField color={color} width={24} height={24} />,
			}}
		/>
		<Tabs.Screen
			name="nearby/index"
			options={{
				title: "Nearby",
				tabBarIcon: ({ color }) => <NavigatorAlt color={color} width={24} height={24} />,
			}}
		/>
		<Tabs.Screen
			name="map/index"
			options={{
				title: "Map",
				tabBarIcon: ({ color }) => <Map color={color} width={24} height={24} />,
			}}
		/>
		<Tabs.Screen
			name="manage/index"
			options={{
				title: "Manage",
				tabBarIcon: ({ color }) => <GridPlus color={color} width={24} height={24} />,
			}}
		/>
	</Tabs>
);
