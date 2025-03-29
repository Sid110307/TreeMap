import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import * as Crypto from "expo-crypto";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { BinMinusIn, Camera, Hashtag, Link, MediaImageFolder, Plus } from "iconoir-react-native";

import BottomSheet from "../../components/bottomSheet";
import Button from "../../components/button";
import InputField from "../../components/inputField";
import Text, { HeadText } from "../../components/text";

import colors from "../../core/colors";
import { databaseManager } from "../../core/database";
import { useEntryState, useGeoState, useUserState } from "../../core/state";

export default () => {
	const router = useRouter();

	const { user } = useUserState();
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
		resetState,
	} = useEntryState();

	const [loading, setLoading] = React.useState(false);
	const [customFields, setCustomFields] = React.useState<
		{ key: string; value: string; isNumeric: boolean }[]
	>([]);

	const save = async () => {
		if (!latitude || !longitude) return;
		if (!title) {
			Toast.show({
				type: "error",
				text1: "Title Required",
				text2: "Please enter a title for your entry.",
			});
			return;
		}
		if (!image) {
			Toast.show({
				type: "error",
				text1: "Image Required",
				text2: "Please upload a valid image or provide a valid image URL.",
			});
			return;
		}

		setLoading(true);
		setMetadata(metadata);

		const fullMetadata = { ...metadata };
		customFields.forEach(({ key, value }) => {
			if (key.trim()) fullMetadata[key] = value;
		});

		const result = await databaseManager.upsert(
			{
				id: Crypto.randomUUID(),
				title,
				description,
				scientific_name: scientificName,
				latitude,
				longitude,
				metadata: fullMetadata,
				image,
			},
			user.id,
		);
		setLoading(false);

		if (result) {
			Toast.show({
				type: "success",
				text1: "Entry Saved!",
				text2: "Your entry has been saved successfully.",
			});

			await databaseManager.supabaseDB?.from("Profiles").upsert({
				id: user.id,
				total_identified: user.totalIdentified + 1,
			});

			resetState();
			router.back();
		} else
			Toast.show({
				type: "error",
				text1: "Error Saving Entry",
				text2: "An error occurred while saving your entry. Please try again.",
			});
	};

	React.useEffect(() => {
		setCustomFields(
			metadata
				? Object.entries(metadata).map(([key, value]) => ({ key, value, isNumeric: true }))
				: [],
		);
	}, [metadata]);

	return (
		<BottomSheet>
			<BottomSheetScrollView
				contentContainerStyle={{ padding: 8, paddingHorizontal: 16, gap: 12 }}
			>
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
				<HeadText
					cta={image && <BinMinusIn color={colors.error} />}
					ctaPress={() => {
						setImage("");
						setHasImageUrl(false);
					}}
				>
					Upload image
				</HeadText>
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
						onPress={() => setHasImageUrl(!hasImageUrl)}
					/>
				</View>
				{hasImageUrl && (
					<InputField
						placeholder="Image URL"
						value={image.startsWith("data:image/jpeg;base64") ? "" : image}
						keyboardType="url"
						onChangeText={setImage}
					/>
				)}
				<HeadText>Other Details</HeadText>
				{customFields.map((field, index) => (
					<View
						key={index}
						style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
					>
						<InputField
							placeholder="Key"
							value={field.key}
							onChangeText={text => {
								const copy = [...customFields];
								copy[index].key = text;

								setCustomFields(copy);
							}}
							style={{ flex: 6 }}
						/>
						<InputField
							placeholder="Value"
							value={field.value}
							onChangeText={text => {
								const copy = [...customFields];
								copy[index].value = text;

								setCustomFields(copy);
							}}
							keyboardType={field.isNumeric ? "numeric" : "default"}
							style={{ flex: 5 }}
						/>
						<Button
							textComponent={
								<Hashtag
									color={field.isNumeric ? colors.primary : colors.dark[100]}
									width={20}
									height={20}
								/>
							}
							style={{
								flex: 1,
								marginVertical: 0,
								borderWidth: 0,
								backgroundColor: "transparent",
							}}
							onPress={() => {
								const copy = [...customFields];
								copy[index].isNumeric = !copy[index].isNumeric;

								setCustomFields(copy);
							}}
						/>
						<Button
							textComponent={
								<BinMinusIn color={colors.error} width={20} height={20} />
							}
							style={{
								flex: 1,
								marginVertical: 0,
								borderWidth: 0,
								backgroundColor: "transparent",
							}}
							onPress={() => {
								const copy = [...customFields];
								copy.splice(index, 1);

								setCustomFields(copy);
							}}
						/>
					</View>
				))}
				<Button
					textComponent={
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								width: "100%",
							}}
						>
							<View
								style={{
									flex: 1,
									height: 1,
									backgroundColor: colors.dark[100],
									marginRight: 8,
								}}
							/>
							<Plus color={colors.dark[100]} />
							<Text style={{ marginHorizontal: 8, color: colors.dark[100] }}>
								Add More
							</Text>
							<View
								style={{
									flex: 1,
									height: 1,
									backgroundColor: colors.dark[100],
									marginLeft: 8,
								}}
							/>
						</View>
					}
					style={{ marginVertical: 0, borderWidth: 0, backgroundColor: colors.light[0] }}
					textStyle={{ color: colors.dark[100] }}
					onPress={() =>
						setCustomFields([...customFields, { key: "", value: "", isNumeric: false }])
					}
				/>
				<Button
					text={(latitude && longitude && "Save") || "Determining geolocation..."}
					textStyle={{ fontFamily: "Medium" }}
					onPress={async () => await save()}
					disabled={!title || !image || !latitude || !longitude}
					loading={loading}
					color={colors.primary}
				/>
			</BottomSheetScrollView>
		</BottomSheet>
	);
};
