import { useCallback, useState } from "react";

export default function useForceRerender() {
	const [_, setDummyState] = useState(false);

	const forceRerender = useCallback(() => {
		setDummyState((prev) => !prev);
	}, []);

	return forceRerender;
}
