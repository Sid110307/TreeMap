import React from "react";
import { Image, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

import { useRouter } from "expo-router";
import { Calendar, MapPin, PageEdit } from "iconoir-react-native";
import { DateTime } from "luxon";

import colors from "../core/colors";
import { useMapState } from "../core/state";
import Text from "./text";

interface DataEntryItemProps {
	item: DataEntry;
	hasMore?: boolean;
	absoluteDate?: boolean;
}

export default (props: DataEntryItemProps) => {
	const router = useRouter();
	const { setLatitude, setLongitude } = useMapState();
	const [pressed, setPressed] = React.useState(false);

	return (
		<View
			style={{
				alignItems: "center",
				gap: 8,
				borderBottomWidth: props.hasMore ? 1 : 0,
				borderBottomColor: colors.dark[400],
				paddingVertical: 8,
			}}
		>
			<View style={{ flexDirection: "row", gap: 16, marginLeft: "auto" }}>
				<Image
					source={{ uri: props.item.image }}
					style={{ width: 64, height: 64, borderRadius: 8 }}
					resizeMode="cover"
				/>
				<View style={{ flex: 1, gap: 8 }}>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Text style={{ fontFamily: "Bold" }}>{props.item.title}</Text>
						{props.item.scientific_name && (
							<Text
								style={{
									fontFamily: "Caption",
									fontSize: 10,
									color: colors.dark[500],
								}}
							>
								{props.item.scientific_name}
							</Text>
						)}
					</View>
					{props.item.description && (
						<Text style={{ textAlign: "justify", fontSize: 12 }}>
							{props.item.description}
						</Text>
					)}
					{props.item.metadata &&
						!Object.values(props.item.metadata).every(value => value.trim() === "") && (
							<View style={{ gap: 4, marginTop: 4 }}>
								{Object.entries(props.item.metadata).map(
									([key, value]) =>
										value.trim() !== "" && (
											<View
												key={key}
												style={{
													flexDirection: "row",
													gap: 4,
													alignItems: "center",
												}}
											>
												<Text>{key}:</Text>
												<Text style={{ fontFamily: "Caption" }}>
													{value}
												</Text>
											</View>
										),
								)}
							</View>
						)}
				</View>
			</View>
			<View style={{ alignSelf: "flex-start", gap: 4 }}>
				<Pressable
					onPress={() => {
						setLatitude(props.item.latitude);
						setLongitude(props.item.longitude);

						router.navigate("/map");
					}}
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 8,
					}}
				>
					<MapPin color={colors.dark[500]} width={16} height={16} />
					<Text
						style={{
							fontFamily: "Caption",
							fontSize: 10,
							color: colors.dark[500],
						}}
					>
						{props.item.latitude}°{props.item.latitude < 0 ? "S" : "N"},{" "}
						{props.item.longitude}°{props.item.longitude < 0 ? "W" : "E"}
					</Text>
				</Pressable>
				<Pressable
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 8,
					}}
					onPress={() => setPressed(!pressed)}
				>
					<Calendar color={colors.dark[500]} width={16} height={16} />
					<Text
						style={{
							fontFamily: "Caption",
							fontSize: 10,
							color: colors.dark[500],
						}}
					>
						Added{" "}
						{props.absoluteDate || pressed
							? DateTime.fromISO(props.item.created_at.replace(" ", "T"), {
									zone: "utc",
								})
									.toLocal()
									.toFormat("'on' MMMM dd, yyyy 'at' hh:mm a")
							: DateTime.fromISO(props.item.created_at.replace(" ", "T"), {
									zone: "utc",
								})
									.toLocal()
									.toRelative()}
					</Text>
				</Pressable>
				{new Date(props.item.updated_at).getTime() !==
					new Date(props.item.created_at).getTime() && (
					<Pressable
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 8,
						}}
						onPress={() => setPressed(!pressed)}
					>
						<PageEdit color={colors.dark[500]} width={16} height={16} />
						<Text
							style={{
								fontFamily: "Caption",
								fontSize: 10,
								color: colors.dark[500],
							}}
						>
							Edited{" "}
							{props.absoluteDate || pressed
								? DateTime.fromISO(props.item.updated_at.replace(" ", "T"), {
										zone: "utc",
									})
										.toLocal()
										.toFormat("'on' MMMM dd, yyyy 'at' hh:mm a")
								: DateTime.fromISO(props.item.updated_at.replace(" ", "T"), {
										zone: "utc",
									})
										.toLocal()
										.toRelative()}
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
};
