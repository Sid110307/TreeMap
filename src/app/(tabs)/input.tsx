import React from "react";
import { ScrollView } from "react-native-gesture-handler";

import { Actions, CoordinatesCard, RecentEntries, StatsCard } from "../../screens/input";

export default () => (
	<ScrollView contentContainerStyle={{ padding: 8, paddingHorizontal: 16 }}>
		<CoordinatesCard />
		<Actions />
		<StatsCard />
		<RecentEntries />
	</ScrollView>
);
