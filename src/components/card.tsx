import React from "react";
import { Text, View } from "react-native";

import colors from "../../assets/colors";

interface CardProps {
	title?: string;
	children?: any;
	style?: any;
}

export default (props: CardProps) => (
	<View
		style={{
			padding: 16,
			backgroundColor: colors.light[0],
			borderRadius: 8,
			marginVertical: 8,
			borderWidth: 1,
			borderColor: colors.light[500],
			gap: 8,
			...props.style,
		}}
	>
		{props.title && (
			<Text
				style={{
					fontFamily: "Medium",
					fontSize: 14,
					letterSpacing: 2,
					textTransform: "uppercase",
				}}
			>
				{props.title}
			</Text>
		)}
		{props.children}
	</View>
);
