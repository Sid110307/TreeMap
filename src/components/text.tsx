import { Text, TextProps } from "react-native";

export default (props: TextProps) => (
	<Text {...props} style={[{ fontFamily: "Regular" }, props.style]}>
		{props.children}
	</Text>
);
