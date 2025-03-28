import React from "react";
import { ActivityIndicator, TextStyle, View, ViewStyle } from "react-native";
import { Pressable } from "react-native-gesture-handler";

import colors from "../core/colors";
import Text from "./text";

interface Props {
	onPress: () => void;
	text?: string;
	textComponent?: React.ReactNode;
	color?: string;
	style?: ViewStyle;
	textStyle?: TextStyle;
	loading?: boolean;
	disabled?: boolean;
}

export default (props: Props) => {
	const [focused, setFocused] = React.useState(false);
	return (
		<Pressable
			onPressIn={() => setFocused(true)}
			onPressOut={() => setFocused(false)}
			style={[
				{
					width: "100%",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: 8,
					marginVertical: 20,
					paddingVertical: 12,
					opacity: props.disabled ? 0.2 : 1,
					backgroundColor: focused
						? colors.dark[500]
						: props.disabled
							? colors.light[0]
							: (props.color ?? colors.light[0]),
					borderColor: focused
						? colors.light[0]
						: props.disabled
							? colors.dark[500]
							: (props.color ?? colors.dark[500]),
					borderWidth: 1,
				},
				props.style,
			]}
			disabled={props.loading || props.disabled}
			onPress={props.onPress}
		>
			{props.loading ? (
				<ActivityIndicator size="small" color={colors.dark[100]} />
			) : (
				<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
					{props.textComponent && props.textComponent}
					{props.text && (
						<Text
							style={[
								{
									color:
										focused || !props.disabled
											? colors.light[0]
											: colors.dark[100],
								},
								props.textStyle,
							]}
						>
							{props.text}
						</Text>
					)}
				</View>
			)}
		</Pressable>
	);
};
