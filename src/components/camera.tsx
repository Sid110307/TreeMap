import React from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { CameraType, CameraView, FlashMode } from "expo-camera";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { requestCameraPermissionsAsync } from "expo-image-picker";
import {
	AutoFlash,
	Camera as CameraIcon,
	Flash,
	FlashOff,
	Redo,
	RotateCameraRight,
} from "iconoir-react-native";

import colors from "../../assets/colors";

import { heightToDp, widthToDp } from "../core/utils";

interface CameraProps {
	image: string;
	setImage: (image: string) => void;
	cameraRef: React.RefObject<CameraView>;
	hideFlash?: boolean;
	cameraProps?: any;
	style?: any;
}

export default (props: CameraProps) => {
	const [permissionGranted, setPermissionGranted] = React.useState<boolean | null>(null);
	const [type, setType] = React.useState<"camera" | "preview">("camera");
	const [face, setFace] = React.useState<CameraType>("back");
	const [flash, setFlash] = React.useState<FlashMode>("off");

	React.useEffect(() => {
		requestCameraPermissionsAsync()
			.then(res => setPermissionGranted(res.granted))
			.catch(console.error);
	}, []);

	return (
		<View style={{ alignItems: "center", justifyContent: "center" }}>
			{permissionGranted ? (
				<>
					<View
						style={{
							width: widthToDp("92%"),
							height: heightToDp("60%"),
							borderColor: type === "camera" ? colors.dark[400] : colors.primary,
							borderWidth: 1,
							borderRadius: 8,
							alignItems: "center",
							justifyContent: "center",
							overflow: "hidden",
							...props.style,
						}}
					>
						{type === "camera" ? (
							<CameraView
								style={{ width: "100%", height: "100%" }}
								facing={face}
								flash={flash}
								ref={props.cameraRef}
								{...props.cameraProps}
							>
								<View
									style={{
										flexDirection: "row",
										justifyContent: "space-between",
										padding: 16,
										width: "100%",
										position: "absolute",
										top: 0,
									}}
								>
									<Pressable
										onPress={() => setFace(face === "back" ? "front" : "back")}
									>
										<RotateCameraRight color={colors.light[500]} />
									</Pressable>
									{props.hideFlash && (
										<Pressable
											onPress={() =>
												setFlash(
													flash === "off"
														? "auto"
														: flash === "auto"
															? "on"
															: "off",
												)
											}
										>
											{flash === "off" ? (
												<FlashOff color={colors.light[500]} />
											) : flash === "auto" ? (
												<AutoFlash color={colors.light[500]} />
											) : (
												<Flash color={colors.light[500]} />
											)}
										</Pressable>
									)}
								</View>
							</CameraView>
						) : (
							<Image
								source={{ uri: props.image }}
								style={{ width: "100%", height: "100%" }}
							/>
						)}
					</View>
					{type === "camera" ? (
						<Pressable
							style={{
								backgroundColor: colors.light[0],
								padding: 16,
								borderRadius: 64,
								justifyContent: "center",
								alignItems: "center",
							}}
							onPress={async () => {
								if (props.cameraRef.current) {
									try {
										const res = await props.cameraRef.current.takePictureAsync({
											base64: true,
										});
										if (!res?.uri) return;

										let imageManipulator = ImageManipulator.manipulate(res.uri);
										imageManipulator = imageManipulator.resize({ width: 511 });
										const image = await imageManipulator.renderAsync();

										const compressedImage = (
											await image.saveAsync({
												base64: true,
												format: SaveFormat.JPEG,
											})
										).base64 as string;

										props.setImage(`data:image/jpeg;base64,${compressedImage}`);
										setType("preview");
									} catch (error) {
										console.error("Error taking or compressing photo:", error);
										Toast.show({
											type: "error",
											text1: "Error",
											text2: "An error occurred while capturing the photo.",
										});
									}
								}
							}}
						>
							<CameraIcon color={colors.dark[400]} />
						</Pressable>
					) : (
						<Pressable
							style={{
								backgroundColor: colors.light[0],
								padding: 16,
								borderRadius: 64,
								justifyContent: "center",
								alignItems: "center",
							}}
							onPress={() => setType("camera")}
						>
							<Redo color={colors.dark[400]} />
						</Pressable>
					)}
				</>
			) : (
				<ActivityIndicator size="large" color={colors.primary} />
			)}
		</View>
	);
};
