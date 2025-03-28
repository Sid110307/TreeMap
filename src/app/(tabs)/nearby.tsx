import React from "react";
import { View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";

import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";
import { RefreshDouble } from "iconoir-react-native";

import Card from "../../components/card";
import DataEntryItem from "../../components/dataEntryItem";
import InputField from "../../components/inputField";
import Text from "../../components/text";

import colors from "../../core/colors";
import { useGeoState } from "../../core/state";

export default () => {
	const [data, setData] = React.useState<DataEntry[]>([]);
	const { latitude, longitude, radius, setRadius, listNearby } = useGeoState();

	useFocusEffect(
		React.useCallback(() => {
			listNearby().then(setData).catch(console.error);
		}, [latitude, longitude, radius]),
	);

	return (
		<ScrollView
			contentContainerStyle={{ padding: 8, paddingHorizontal: 16 }}
			refreshControl={
				<RefreshControl
					refreshing={!data}
					onRefresh={() => listNearby().then(setData).catch(console.error)}
				/>
			}
		>
			<Card title="Options">
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						gap: 8,
					}}
				>
					<Text style={{ flex: 3 }}>Search Radius (m):</Text>
					<InputField
						value={radius.toString()}
						style={{ flex: 1 }}
						onChangeText={text => setRadius(parseInt(text))}
						keyboardType="number-pad"
					/>
				</View>
			</Card>
			<Card
				title="Nearby Trees"
				cta={<RefreshDouble color={colors.primary} width={16} height={16} />}
				ctaPress={async () => setData(await listNearby())}
			>
				<FlashList
					data={data}
					estimatedItemSize={120}
					ListEmptyComponent={() => (
						<Text style={{ textAlign: "center", marginVertical: 8 }}>
							No nearby trees found.
						</Text>
					)}
					renderItem={({ item }: { item: DataEntry }) => (
						<DataEntryItem item={item} hasMore={data!.length > 1} />
					)}
					keyExtractor={item => item.id}
				/>
			</Card>
		</ScrollView>
	);
};
