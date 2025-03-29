import React from "react";
import { ActivityIndicator, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";

import Card from "../../components/card";
import DataEntryItem from "../../components/dataEntryItem";
import Text from "../../components/text";

import colors from "../../core/colors";
import { databaseManager } from "../../core/database";
import { DataEntry } from "../../core/types";

export default () => {
	const router = useRouter();

	const [loading, setLoading] = React.useState(true);
	const [data, setData] = React.useState<DataEntry[]>([]);

	useFocusEffect(
		React.useCallback(() => {
			setLoading(true);
			databaseManager.supabaseDB
				?.from("TreeMap")
				.select("*")
				.order("created_at", { ascending: false })
				.then(({ data, error }) => {
					if (error) {
						console.error(error);
						setLoading(false);
						return;
					}

					if (data) setData(data.map(databaseManager.parseMetadata));
					setLoading(false);
				});
		}, []),
	);

	return (
		<View style={{ flex: 1, padding: 16 }}>
			<Card title="My Trees" style={{ flex: 1 }}>
				<FlashList
					data={data}
					refreshing={loading}
					estimatedItemSize={120}
					ListEmptyComponent={() => (
						<View
							style={{
								height: "100%",
								justifyContent: "center",
								alignItems: "center",
								marginVertical: 16,
							}}
						>
							{loading ? (
								<ActivityIndicator size="large" color={colors.primary} />
							) : (
								<Text style={{ textAlign: "center" }}>
									No trees found. Add a tree to get started!
								</Text>
							)}
						</View>
					)}
					renderItem={({ item }: { item: DataEntry }) => (
						<DataEntryItem item={item} hasMore={data!.length > 1} hideAddedBy />
					)}
					keyExtractor={item => item.id}
				/>
			</Card>
		</View>
	);
};
