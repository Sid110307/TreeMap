import React from "react";
import { Image, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

import { useRouter } from "expo-router";
import { Calendar, MapPin, PageEdit } from "iconoir-react-native";

import colors from "../core/colors";
import Text from "./text";

export default (props: { item: DataEntry; hasMore?: boolean }) => {
	const router = useRouter();
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
					onPress={() => router.navigate("/map")}
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
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 8,
					}}
				>
					<Calendar color={colors.dark[500]} width={16} height={16} />
					<Text
						style={{
							fontFamily: "Caption",
							fontSize: 10,
							color: colors.dark[500],
						}}
					>
						Added on{" "}
						{new Date(props.item.created_at).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "2-digit",
						})}{" "}
						at{" "}
						{new Date(props.item.created_at).toLocaleTimeString("en-US", {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Text>
				</View>
				{new Date(props.item.updated_at).getTime() !==
					new Date(props.item.created_at).getTime() && (
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: 8,
						}}
					>
						<PageEdit color={colors.dark[500]} width={16} height={16} />
						<Text
							style={{
								fontFamily: "Caption",
								fontSize: 10,
								color: colors.dark[500],
							}}
						>
							Updated on{" "}
							{new Date(props.item.updated_at).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "2-digit",
							})}{" "}
							at{" "}
							{new Date(props.item.updated_at).toLocaleTimeString("en-US", {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</Text>
					</View>
				)}
			</View>
		</View>
	);
};
