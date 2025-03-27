import React from "react";
import { KeyboardTypeOptions, StyleProp, TextInputProps, TextStyle } from "react-native";

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

import colors from "../../assets/colors";

import { heightToDp, widthToDp } from "../utils";

interface InputProps {
	value?: string;
	onChangeText?: (text: string) => void;
	keyboardType?: KeyboardTypeOptions;
	placeholder?: string;
	multiline?: boolean;
	backgroundColor?: string;
	textColor?: string;
	customStyle?: StyleProp<TextStyle>;
	customProps?: TextInputProps;
}

export default (props: InputProps) => {
	const [focused, setFocused] = React.useState(false);
	return (
		<BottomSheetTextInput
			{...props.customProps}
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
					width: "100%",
					backgroundColor: props.backgroundColor ?? colors.light[300],
					color: props.textColor ?? colors.dark[500],
					borderRadius: 8,
					borderWidth: 1,
					borderColor: focused ? colors.tint[0] : colors.light[500],
					paddingLeft: widthToDp("5%"),
				},
				props.customStyle,
			]}
			placeholderTextColor={colors.dark[500]}
			multiline={props.multiline}
		/>
	);
};
