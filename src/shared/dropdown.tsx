import {
	type MouseEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import "./dropdown.css";
import type { Property } from "csstype";
import { useOutsideClick } from "../hooks/useOutsideClick";

export type Alignment = "left" | "center" | "right";
export type Direction = "up" | "down";

const Dropdown = ({
	dropdownButton,
	alignment,
	direction,
	onClick,
	className,
	isOpen: _isOpen,
	buttonClass,
	buttonProps,
	useDefaultButtonStyle,
	backgroundColor,
	dropdownContentClassName,
	onOpenChange,
	listRef,
	scrollElementRef,
	disableScroll,
	forceStaticPosition,
	children,
}: {
	dropdownButton: ReactNode;
	alignment?: Alignment;
	direction?: Direction;
	onClick?: (e: MouseEvent) => void;
	className?: string;
	isOpen?: boolean;
	buttonClass?: string;
	buttonProps?: React.ComponentProps<"div"> & {
		disabled?: boolean;
	};
	useDefaultButtonStyle?: boolean;
	backgroundColor?: Property.BackgroundColor;
	dropdownContentClassName?: string;
	onOpenChange?: (isOpen: boolean) => void;
	listRef?: React.RefObject<HTMLUListElement | null>;
	scrollElementRef?: React.RefObject<HTMLDivElement | null>;
	disableScroll?: boolean;
	forceStaticPosition?: boolean;
	children?:
		| ReactNode
		| ((params: {
				setParentScrollEnabled: (enabled: boolean) => void;
				closeDropdown: () => void;
		  }) => ReactNode);
}) => {
	const [isOpen, setIsOpenState] = useState(_isOpen ?? false);
	useEffect(() => {
		setIsOpenState(_isOpen ?? false);
	}, [_isOpen]);

	const dropdownContentRef = useRef<HTMLDivElement>(null);
	const dropdownWrapperRef = useRef<HTMLDivElement>(null);
	const [dropdownMaxHeight, setDropdownMaxHeight] = useState(0);
	const [dropdownWrapperHeight, setDropdownWrapperHeight] = useState(0);
	const [scrollEnabled, setScrollEnabledState] = useState(true);

	useEffect(() => {
		const currentWrapper = dropdownWrapperRef.current;
		const currentList = listRef?.current ?? window;
		const currentScrollElement = scrollElementRef?.current ?? document;

		const handleMove = () => {
			if (currentWrapper) {
				setDropdownMaxHeight(
					window.innerHeight - currentWrapper.getBoundingClientRect().y,
				);
			}
		};

		const handleSize = () => {
			if (currentWrapper) {
				setDropdownWrapperHeight(currentWrapper.getBoundingClientRect().height);
			}
		};

		const sizeObserverHandleSize = new ResizeObserver((entries) => {
			entries.forEach(() => {
				handleSize();
			});
		});

		if (currentWrapper) {
			sizeObserverHandleSize.observe(currentWrapper);
		}
		if (currentScrollElement) {
			currentScrollElement.addEventListener("scroll", handleMove);
		}
		const sizeObserverHandleMove = new ResizeObserver((entries) => {
			entries.forEach(() => {
				handleMove();
			});
		});
		if (currentList) {
			if (currentList instanceof Window) {
				currentList.addEventListener("resize", handleMove);
			} else {
				sizeObserverHandleMove.observe(currentList);
			}
		}

		handleMove();
		handleSize();

		return () => {
			if (currentWrapper) {
				sizeObserverHandleSize.disconnect();
			}
			if (currentScrollElement) {
				currentScrollElement.removeEventListener("scroll", handleMove);
			}
			if (currentList) {
				if (currentList instanceof Window) {
					currentList.removeEventListener("resize", handleMove);
				} else {
					sizeObserverHandleMove.disconnect();
				}
			}
		};
	}, [listRef, scrollElementRef]);

	const requiresScroll = dropdownMaxHeight <= dropdownWrapperHeight;

	dropdownContentRef.current?.style.setProperty(
		"--maxHeight",
		dropdownMaxHeight > 0 ? `${dropdownMaxHeight}px` : "0",
	);

	useDefaultButtonStyle ??= true;
	alignment ??= "left";
	direction ??= "down";
	backgroundColor ??= "var(--col-background)";
	disableScroll ??= false;
	forceStaticPosition ??= false;

	const isOpenClass = isOpen ? "show" : "hide";
	const setIsOpen = useCallback(
		(isOpen: boolean) => {
			onOpenChange?.call(null, isOpen);
			setIsOpenState(isOpen);
		},
		[onOpenChange],
	);

	const toggleOpen = () => {
		!buttonProps?.disabled && setIsOpen(!isOpen);
	};

	return (
		<div
			ref={useOutsideClick(useCallback(() => setIsOpen(false), [setIsOpen]))}
			onClick={onClick}
			className={`dropdown ${className} ${forceStaticPosition ? "forceStatic" : ""}`}
		>
			<div
				{...buttonProps}
				role="button"
				tabIndex={0}
				className={`${buttonClass} ${useDefaultButtonStyle ? "button" : ""} ${buttonProps?.disabled ? "disabledButton" : ""}`}
				onClick={toggleOpen}
				onKeyUp={(e) => e.key === "Enter" && toggleOpen()}
			>
				{dropdownButton}
			</div>
			<div className={`arrowContainer ${direction}`}>
				<div className={`dropdownMenu ${isOpenClass} ${direction}`}>
					<div className={`dropdownWrapper ${direction}`}>
						<div
							className={`arrow ${direction}`}
							style={{ backgroundColor: backgroundColor }}
						></div>
					</div>
				</div>
			</div>
			<div
				className={`dropdownMenu ${isOpenClass} ${alignment}Align ${direction}`}
			>
				<div
					ref={dropdownWrapperRef}
					className={`dropdownWrapper ${direction}`}
				>
					<div
						ref={dropdownContentRef}
						className={`dropdownContent shimmerBackground ${dropdownContentClassName}`}
						style={{
							backgroundColor: backgroundColor,
						}}
					>
						<div
							className={`${scrollEnabled && requiresScroll ? "scroll" : ""}`}
						>
							{typeof children === "function"
								? children({
										setParentScrollEnabled: setScrollEnabledState,
										closeDropdown: () => {
											if (isOpen) setIsOpen(false);
										},
									})
								: children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dropdown;
