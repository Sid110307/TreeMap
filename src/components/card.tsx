import React from "react";
import { TextStyle, ViewStyle } from "react-native";
import { Pressable } from "react-native-gesture-handler";

import * as Haptics from "expo-haptics";

import colors from "../core/colors";
import { HeadText } from "./text";

interface CardProps {
	cta?: React.ReactNode;
	children?: React.ReactNode;
	title?: string;
	titleStyle?: TextStyle;
	style?: ViewStyle;
	onPress?: () => void;
}

export default (props: CardProps) => (
	<Pressable
		style={[
			{
				padding: 16,
				backgroundColor: colors.light[0],
				borderRadius: 8,
				marginVertical: 8,
				borderWidth: 1,
				borderColor: colors.light[400],
				gap: 8,
			},
			props.style,
		]}
		onPress={async () => {
			if (!props.onPress) return;

			await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			props.onPress();
		}}
	>
		{props.title && (
			<HeadText style={props.titleStyle} cta={props.cta}>
				{props.title}
			</HeadText>
		)}
		{props.children}
	</Pressable>
);
