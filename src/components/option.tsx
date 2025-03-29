import React from "react";
import { View, ViewProps } from "react-native";
import { Pressable } from "react-native-gesture-handler";

import { ArrowUpRight, EditPencil } from "iconoir-react-native";

import colors from "../core/colors";

import Text from "./text";

interface OptionProps extends ViewProps {
	text: string;
	type?: "external" | "edit" | "normal";
	color?: string;
	component?: React.ReactNode;
	disabled?: boolean;
	onPress?: () => void;
}

export default (props: OptionProps) => {
	const type = props.type ?? "normal";
	return (
		<View
			{...props}
			style={{
				width: "100%",
				backgroundColor: colors.light[0],
				alignSelf: "center",
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				paddingVertical: 8,
				paddingHorizontal: 16,
				gap: 8,
			}}
		>
			<Text style={{ fontFamily: "Medium" }}>{props.text}</Text>
			<Pressable
				onPress={props.onPress}
				disabled={props.disabled}
				style={{
					backgroundColor: props.color ?? colors.secondary,
					opacity: props.disabled ? 0.5 : 1,
					borderWidth: 1,
					borderColor: colors.light[500],
					paddingVertical: type === "normal" && !props.component ? 8 : 6,
					paddingHorizontal: type === "normal" && !props.component ? 16 : 6,
					borderRadius: 64,
					gap: 8,
					flexDirection: "row",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				{props.component ||
					(props.type === "external" ? (
						<ArrowUpRight color={colors.light[0]} width={16} height={16} />
					) : props.type === "edit" ? (
						<EditPencil color={colors.light[0]} width={16} height={16} />
					) : (
						<Text style={{ color: colors.light[200], fontSize: 12 }}>{props.text}</Text>
					))}
			</Pressable>
		</View>
	);
};
