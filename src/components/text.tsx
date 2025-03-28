import React from "react";
import { Text as NativeText, TextProps } from "react-native";
import Animated, { useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedText = Animated.createAnimatedComponent(NativeText);

interface IncrementTextProps extends TextProps {
	value: number;
	duration?: number;
}

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

export const IncrementText = (props: IncrementTextProps) => {
	const { value, duration = 1000 } = props;
	const animatedValue = useSharedValue(value);

	React.useEffect(() => {
		if (value === animatedValue.value) return;
		animatedValue.value = withTiming(value, { duration });
	}, [value, duration]);

	const derivedText = useDerivedValue(() => Math.round(animatedValue.value).toString());
	return (
		<AnimatedText {...props} style={[{ fontFamily: "Regular" }, props.style]}>
			{derivedText.value}
		</AnimatedText>
	);
};

const Text = (props: TextProps) => (
	<NativeText {...props} style={[{ fontFamily: "Regular" }, props.style]}>
		{props.children}
	</NativeText>
);

export default Text;
