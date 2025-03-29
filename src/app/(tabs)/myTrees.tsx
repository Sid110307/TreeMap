import React from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";

import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "expo-router";

import DataEntryItem from "../../components/dataEntryItem";
import Text, { HeadText } from "../../components/text";

import colors from "../../core/colors";
import { databaseManager } from "../../core/database";
import { useUserState } from "../../core/state";
import { DataEntry } from "../../core/types";

export default () => {
	const { user } = useUserState();

	const [loading, setLoading] = React.useState(true);
	const [data, setData] = React.useState<DataEntry[]>([]);

	useFocusEffect(
		React.useCallback(() => {
			setLoading(true);
			databaseManager
				.query("SELECT * FROM TreeMap ORDER BY created_at DESC")
				.then(setData)
				.catch(error => {
					console.error(error);
					Toast.show({
						type: "error",
						text1: "Error Fetching Data",
						text2: "An error occurred while fetching your data.",
					});
				})
				.finally(() => setLoading(false));

			databaseManager.supabaseDB
				?.from("TreeMap")
				.select("*")
				.eq("user_id", user.id)
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
		<View style={{ flex: 1, padding: 16, gap: 8 }}>
			<HeadText>My Trees ({user.totalIdentified})</HeadText>
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
		</View>
	);
};
