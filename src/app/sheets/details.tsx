import React from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import * as Crypto from "expo-crypto";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { BinMinusIn, Camera, Link, MediaImageFolder } from "iconoir-react-native";

import colors from "../../../assets/colors";

import BottomSheet from "../../components/bottomSheet";
import Button from "../../components/button";
import InputField from "../../components/inputField";
import { HeadText } from "../../components/text";

import { databaseManager } from "../../core/database";
import { useEntryState, useGeoState } from "../../core/state";

export default () => {
	const router = useRouter();

	const { latitude, longitude } = useGeoState();
	const {
		title,
		setTitle,
		description,
		setDescription,
		scientificName,
		setScientificName,
		image,
		setImage,
		hasImageUrl,
		setHasImageUrl,
		metadata,
		setMetadata,
	} = useEntryState();

	const save = async () => {
		const result = await databaseManager.upsert({
			id: Crypto.randomUUID(),
			title,
			description,
			scientific_name: scientificName,
			latitude,
			longitude,
			metadata,
			image,
		});

		if (result)
			Toast.show({
				type: "success",
				text1: "Entry Saved!",
				text2: "Your entry has been saved successfully.",
			});
		else
			Toast.show({
				type: "error",
				text1: "Error Saving Entry",
				text2: "An error occurred while saving your entry. Please try again.",
			});
	};

	return (
		<BottomSheet>
			<HeadText>Enter Details</HeadText>
			<InputField placeholder="Title*" value={title} onChangeText={setTitle} />
			<InputField
				placeholder="Description (optional)"
				value={description}
				onChangeText={setDescription}
				multiline
			/>
			<InputField
				placeholder="Scientific Name (optional)"
				value={scientificName}
				onChangeText={setScientificName}
			/>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<HeadText>Upload image</HeadText>
				{image && (
					<Pressable
						onPress={() => {
							setImage("");
							setHasImageUrl(false);
						}}
					>
						<BinMinusIn color={colors.error} />
					</Pressable>
				)}
			</View>
			<View style={{ flexDirection: "row", gap: 8 }}>
				<Button
					textComponent={<Camera color={colors.dark[100]} />}
					style={{ flex: 2, marginVertical: 0 }}
					onPress={() => router.navigate("/sheets/camera")}
				/>
				<Button
					textComponent={<MediaImageFolder color={colors.dark[100]} />}
					style={{ flex: 2, marginVertical: 0 }}
					onPress={async () => {
						const res = await ImagePicker.launchImageLibraryAsync({
							base64: true,
							mediaTypes: ["images"],
							allowsEditing: true,
							aspect: [3, 4],
						});
						if (res.canceled) return;

						let imageManipulator = ImageManipulator.manipulate(res.assets[0].uri);
						imageManipulator = imageManipulator.resize({ width: 511 });
						const image = await imageManipulator.renderAsync();

						const compressedImage = (
							await image.saveAsync({
								base64: true,
								format: SaveFormat.JPEG,
							})
						).base64 as string;
						setImage(`data:image/jpeg;base64,${compressedImage}`);
					}}
				/>
				<Button
					textComponent={<Link color={colors.dark[100]} />}
					style={{ flex: 1, marginVertical: 0 }}
					onPress={() => setHasImageUrl(true)}
				/>
			</View>
			{hasImageUrl && (
				<InputField
					placeholder="Image URL"
					value={image.startsWith("data:image/jpeg;base64") ? "" : image}
					onChangeText={setImage}
				/>
			)}
			<HeadText>Other Details</HeadText>
			<InputField
				placeholder="Tree Diameter (cm)"
				value={metadata.treeDiameter}
				onChangeText={treeDiameter => setMetadata({ ...metadata, treeDiameter })}
			/>
			<InputField
				placeholder="Height (m)"
				value={metadata.height}
				onChangeText={height => setMetadata({ ...metadata, height })}
			/>
			<Button
				text={(latitude && longitude && "Save") || "Determining geolocation..."}
				style={{ marginBottom: 64 }}
				textStyle={{ fontFamily: "Medium" }}
				onPress={async () => await save()}
				disabled={!title || !latitude || !longitude}
			/>
		</BottomSheet>
	);
};
