import React from "react";
import { KeyboardTypeOptions, TextInputProps } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import colors from "../core/colors";
import { heightToDp, widthToDp } from "../core/utils";

interface InputProps {
	keyboardType?: KeyboardTypeOptions;
	backgroundColor?: string;
	textColor?: string;
}

export default (props: TextInputProps & InputProps) => {
	const [focused, setFocused] = React.useState(false);
	return (
		<TextInput
			{...props}
			onFocus={() => setFocused(true)}
			onBlur={() => setFocused(false)}
			onChangeText={props.onChangeText}
			keyboardType={props.keyboardType ?? "default"}
			value={props.value}
			placeholder={props.placeholder}
			underlineColorAndroid="transparent"
			style={[
				{
					fontFamily: "Regular",
					height: props.multiline ? heightToDp("10%") : heightToDp("5%"),
					backgroundColor: props.backgroundColor ?? colors.light[300],
					color: props.textColor ?? colors.dark[500],
					borderRadius: 8,
					borderWidth: 1,
					borderColor: focused ? colors.tint[0] : colors.light[500],
					paddingLeft: widthToDp("5%"),
				},
				props.style,
			]}
			placeholderTextColor={colors.light[500]}
			multiline={props.multiline}
		/>
	);
};
