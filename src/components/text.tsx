import React from "react";
import { Text as NativeText, TextProps } from "react-native";
import Animated, {
	useAnimatedProps,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

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
	const { value, duration = 1000, style, ...rest } = props;
	const animatedValue = useSharedValue(value);

	React.useEffect(() => {
		if (value !== animatedValue.value) animatedValue.value = withTiming(value, { duration });
	}, [value, duration]);

	const derivedText = useDerivedValue(() => Math.round(animatedValue.value).toString());
	const animatedProps = useAnimatedProps(() => ({ children: derivedText.value }));

	return (
		<AnimatedText
			{...rest}
			animatedProps={animatedProps}
			style={[{ fontFamily: "Regular" }, style]}
		/>
	);
};

const Text = (props: TextProps) => (
	<NativeText {...props} style={[{ fontFamily: "Regular" }, props.style]}>
		{props.children}
	</NativeText>
);

export default Text;
