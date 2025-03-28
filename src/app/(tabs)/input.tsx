import React from "react";
import { View } from "react-native";

import { Actions, CoordinatesCard, StatsCard } from "../../screens/input";

export default () => (
	<View style={{ padding: 8, paddingHorizontal: 16 }}>
		<CoordinatesCard />
		<Actions />
		<StatsCard />
	</View>
);
