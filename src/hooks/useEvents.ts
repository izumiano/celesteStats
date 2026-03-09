import { useEffect, useRef, useState } from "react";

export const useWindowEvent = <T extends HTMLElement>(
	type: keyof WindowEventMap,
	callback: () => void,
) => {
	const ref = useRef<T>(null);

	useEffect(() => {
		const handleScroll = () => {
			callback();
		};

		window.addEventListener(type, handleScroll);

		return () => {
			window.removeEventListener(type, handleScroll);
		};
	}, [callback, type]);

	return ref;
};

export const useDomEvent = <T extends HTMLElement>({
	event,
	callback,
}:
	| {
			event: Exclude<keyof HTMLElementEventMap, "resize">;
			callback: (element: T | null) => void;
	  }
	| {
			event: "resize";
			callback: (element: T | null, rect: DOMRectReadOnly) => void;
	  }) => {
	const element = useRef<T>(null);

	useEffect(() => {
		const currentElement = element.current;
		if (!currentElement) {
			return;
		}

		if (event === "resize") {
			const onEvent = (rect: DOMRectReadOnly) => {
				callback(element.current, rect);
			};
			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					onEvent(entry.contentRect);
				}
			});
			resizeObserver.observe(currentElement);

			return () => {
				resizeObserver.unobserve(currentElement);
			};
		}

		const onEvent = () => {
			callback(element.current);
		};

		currentElement.addEventListener(event, () => onEvent);
		return () => {
			currentElement.removeEventListener(event, onEvent);
		};
	}, [callback, event]);

	return element;
};

export const useOtherElementEvent = <T extends HTMLElement>({
	element,
	eventTypes,
	callback,
}: {
	element: React.RefObject<T | null>;
	eventTypes: readonly (keyof HTMLElementEventMap)[];
	callback: () => void;
}) => {
	const [isAdded, setIsAdded] = useState(false);

	useEffect(() => {
		if (isAdded) return;

		const handleEvent = () => {
			callback();
		};

		const currentElement = element.current;
		if (currentElement) {
			for (const eventType of eventTypes) {
				if (eventType === "resize") {
					const resizeObserver = new ResizeObserver(() => {
						callback();
					});
					resizeObserver.observe(currentElement);
					continue;
				}

				currentElement.addEventListener(eventType, handleEvent);
			}
			setIsAdded(true);
		}
	}, [callback, isAdded, element, eventTypes]);

	return element;
};
