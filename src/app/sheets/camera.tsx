import React from "react";

import { BottomSheetView } from "@gorhom/bottom-sheet";

import BottomSheet from "../../components/bottomSheet";
import Camera from "../../components/camera";
import { HeadText } from "../../components/text";

import { useEntryState } from "../../core/state";

export default () => {
	const cameraRef = React.useRef(null);
	const { setImage } = useEntryState();

	return (
		<BottomSheet>
			<BottomSheetView style={{ padding: 16, gap: 12 }}>
				<HeadText>Take a photo</HeadText>
				<Camera cameraRef={cameraRef} setImage={setImage} />
			</BottomSheetView>
		</BottomSheet>
	);
};
