import React from "react";
import { ScrollView } from "react-native-gesture-handler";

import {
	Actions,
	CoordinatesCard,
	RecentEntries,
	StatsCard,
	UpdateButton,
} from "../../screens/input";

export default () => (
	<ScrollView contentContainerStyle={{ padding: 8, paddingHorizontal: 16 }}>
		<UpdateButton />
		<CoordinatesCard />
		<StatsCard />
		<Actions />
		<RecentEntries />
	</ScrollView>
);
