import { Text as NativeText, TextProps } from "react-native";

export const HeadText = (props: TextProps) => (
	<Text
		{...props}
		style={[
			{
				fontFamily: "Medium",
				fontSize: 14,
				letterSpacing: 2,
				textTransform: "uppercase",
			},
			props.style,
		]}
	>
		{props.children}
	</Text>
);

const Text = (props: TextProps) => (
	<NativeText {...props} style={[{ fontFamily: "Regular" }, props.style]}>
		{props.children}
	</NativeText>
);

export default Text;
