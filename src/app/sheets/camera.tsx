import React from "react";

import Camera from "../../components/camera";
import { HeadText } from "../../components/text";

import { useEntryState } from "../../state";
import { BottomSheet } from "../../utils";

export default () => {
	const cameraRef = React.useRef(null);
	const { image, setImage } = useEntryState();

	return (
		<BottomSheet>
			<HeadText>Take a photo</HeadText>
			<Camera cameraRef={cameraRef} image={image} setImage={setImage} />
		</BottomSheet>
	);
};
