import React from "react";
import { Text as NativeText, TextProps, TextStyle, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface IncrementTextProps extends TextProps {
	value: number;
	style?: TextStyle;
	duration?: number;
}

interface IncrementDigitProps extends TextProps {
	digit: string;
	height?: number;
	duration?: number;
	style?: any;
}

export const IncrementDigit = (props: IncrementDigitProps) => {
	const { digit, height = 40, duration = 1000, style, ...rest } = props;
	const DIGITS = [...Array(10).keys()].map(i => i.toString());
	const translateY = useSharedValue(0);

	React.useEffect(() => {
		const targetIndex = DIGITS.indexOf(digit);
		if (targetIndex !== -1) translateY.value = withTiming(-targetIndex * height, { duration });
	}, [digit]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	return (
		<View style={{ height, overflow: "hidden" }}>
			<Animated.View style={animatedStyle}>
				{DIGITS.map(d => (
					<Text {...rest} key={d} style={[{ height, textAlign: "center" }, style]}>
						{d}
					</Text>
				))}
			</Animated.View>
		</View>
	);
};

export const IncrementText = (props: IncrementTextProps) => {
	const { value, duration = 1000, style, ...rest } = props;
	const split = value.toString().split("");

	return (
		<View style={{ flexDirection: "row" }}>
			{split.map((char, index) => {
				return /\d/.test(char) ? (
					<IncrementDigit
						{...rest}
						key={index}
						digit={char}
						duration={duration}
						height={style?.fontSize || 40}
						style={style}
					/>
				) : (
					<Text
						{...rest}
						key={index}
						style={[{ height: style?.fontSize || 40, textAlign: "center" }, style]}
					>
						{char}
					</Text>
				);
			})}
		</View>
	);
};

export const HeadText = (props: TextProps & { cta?: React.ReactNode }) => (
	<View
		style={{
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
		}}
	>
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
		{props.cta}
	</View>
);

const Text = (props: TextProps) => (
	<NativeText {...props} style={[{ fontFamily: "Regular" }, props.style]}>
		{props.children}
	</NativeText>
);

export default Text;
