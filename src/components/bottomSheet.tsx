import { Pressable } from "react-native-gesture-handler";

import { BottomSheetProps, default as NativeBottomSheet } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

export default (props: BottomSheetProps) => {
	const router = useRouter();
	return (
		<NativeBottomSheet
			{...props}
			onClose={router.back}
			enablePanDownToClose
			backdropComponent={_ => (
				<Pressable
					style={{ flex: 1, backgroundColor: "#00000080" }}
					onPress={router.back}
				/>
			)}
		>
			{props.children}
		</NativeBottomSheet>
	);
};
