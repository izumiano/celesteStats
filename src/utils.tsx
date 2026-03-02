import type { CSSProperties } from "react";

export async function sleepFor(
	milliseconds: number,
	abortSignal: AbortSignal | null = null,
) {
	await new Promise((resolve) => setTimeout(resolve, milliseconds));

	if (abortSignal?.aborted) {
		return { wasAborted: true };
	}

	return { wasAborted: false };
}

export function waitForNextFrame() {
	return new Promise((resolve) => {
		requestAnimationFrame(resolve);
	});
}

export function remToPx(remValue: number) {
	const rootFontSize = parseFloat(
		getComputedStyle(document.documentElement).fontSize,
	);

	const pxValue = remValue * rootFontSize;

	return pxValue;
}

export function dvwToPx(dvwValue: number) {
	const dynamicViewportWidth = window.innerWidth;

	const pixelValue = (dvwValue / 100) * dynamicViewportWidth;

	return pixelValue;
}

export function dvhToPx(dvhValue: number) {
	const dynamicViewportHeight = window.innerHeight;

	const pixelValue = (dvhValue / 100) * dynamicViewportHeight;

	return pixelValue;
}

export type MinMaxType =
	| { min: number; max: number }
	| { min: number; max?: number }
	| { min?: number; max: number }
	| undefined;

export function clamp(value: number, params: MinMaxType) {
	return Math.max(
		params?.min ?? -Infinity,
		Math.min(value, params?.max ?? Infinity),
	);
}

export function capitalizeFirstLetter(str: string) {
	if (str.length === 0) {
		return "";
	}
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isCapital(str: string) {
	for (const c of str) {
		if (c !== c.toUpperCase()) {
			return false;
		}
	}
	return true;
}

export function dialogifyKey(
	key: string | number | readonly string[] | undefined,
) {
	key =
		String(key)
			.replaceAll(/-|_/g, " ") // replace - and _ with spaces
			.match(/\b\w+\b/g) // match words
			?.map((word) => capitalizeFirstLetter(word))
			.join("") ?? "";
	const words = [];
	let word = "";
	for (const c of key) {
		if (isCapital(c) && word !== "") {
			words.push(word);
			word = "";
		}

		word += c;
	}
	if (word !== "") {
		words.push(word);
	}
	return words.reduce((prev, word) => `${prev} ${word}`);
}

export function removeDiacritics(str: string) {
	// Normalize the string to its canonical decomposition form (NFD).
	// This separates base characters from their diacritical marks.
	const normalizedStr = str.normalize("NFD");

	// Use a regular expression to remove all Unicode diacritical marks.
	// The Unicode range U+0300–U+036F covers most combining diacritical marks.
	const withoutDiacritics = normalizedStr.replace(/[\u0300-\u036f]/g, "");

	return withoutDiacritics;
}

export function removeNonAlphanumeric(str: string) {
	return str.replace(/[^a-zA-Z0-9]/g, "");
}

export type Alignment = "left" | "center" | "right";

export function isElementInViewport(
	element: HTMLElement,
	tolerance: number = 0,
) {
	const rect = element.getBoundingClientRect();
	return (
		rect.bottom >= -tolerance &&
		rect.top <= window.innerHeight + tolerance &&
		rect.right >= -tolerance &&
		rect.left <= window.innerWidth + tolerance
	);
}

export type UUIDType = `${string}-${string}-${string}-${string}-${string}`;

export interface ProgressCSS extends CSSProperties {
	"--progress": string | number;
}

/**
 *
 * @param date
 * @param formatString
 * yyyy - year,
 * MM - month value,
 * m* - full month name
 * m - month name character (the amount of m's decide how many character)
 * dd - day value
 * d - day value without start padding
 * @returns
 */
export function formatDate<TUndefined>(
	date: Date | undefined | null,
	formatString: string,
	unknownValue: TUndefined,
) {
	if (!date) {
		return unknownValue;
	}

	const year = String(date.getFullYear());
	const monthValue = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed, so add 1
	const month = date.toLocaleString("default", { month: "long" });
	const day = String(date.getDate());

	formatString = formatString
		.replaceAll("yyyy", year)
		.replaceAll("MM", monthValue)
		.replaceAll("m*", month)
		.replaceAll("dd", day.padStart(2, "0"))
		.replaceAll("d", day);

	let ret = "";

	let mCount = 0;
	for (const char of formatString) {
		if (char === "m") {
			ret += month.at(mCount) ?? "";
			mCount++;
			continue;
		}
		mCount = 0;
		ret += char;
	}

	return ret;
}

export function checkElementOverflow(element: HTMLElement) {
	const isHorizontallyOverflowing = element.scrollWidth > element.clientWidth;
	const isVerticallyOverflowing = element.scrollHeight > element.clientHeight;

	return {
		isHorizontallyOverflowing,
		isVerticallyOverflowing,
		isOverflowing: isHorizontallyOverflowing || isVerticallyOverflowing,
	};
}

export const fullScreenWidth = dvwToPx(100);

export function isValidDate(date: Date) {
	return date instanceof Date && !Number.isNaN(date.getTime());
}

export type MimeType =
	| "text/plain"
	| "text/html"
	| "text/css"
	| "application/javascript"
	| "application/json";

export function downloadObjectAsFile({
	fileName,
	data,
	mimeType,
	excludeKeys,
	jsonSpace,
}: { fileName: string } & (
	| ({
			data: object;
			mimeType?: "application/json";
			excludeKeys?: string[];
			jsonSpace?: string | number;
	  } extends infer JsonObj extends { mimeType?: MimeType }
			? JsonObj
			: never)
	| {
			data: string;
			mimeType?: MimeType;
			excludeKeys?: undefined;
			jsonSpace?: undefined;
	  }
)) {
	mimeType ??= "text/plain";
	excludeKeys ??= [];

	const a = document.createElement("a");
	a.href = `data:${mimeType};charset=utf-8,${encodeURIComponent(
		typeof data === "string"
			? data
			: JSON.stringify(
					data,
					(key, value) => {
						if (excludeKeys.includes(key)) {
							return undefined;
						}
						return value;
					},
					jsonSpace,
				),
	)}`;
	a.download = fileName;

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

export type Require<T extends object, Incl extends keyof T> = Omit<T, Incl> & {
	[Key in Incl]-?: T[Incl];
};

export function roundToNearestDecimal(number: number, decimal: number) {
	return Math.round(number / decimal) * decimal;
}

export function ceilToNearestDecimal(number: number, decimal: number) {
	return Math.ceil(number / decimal) * decimal;
}

export class AbortedOperation {
	public reason?: string;
	constructor(reason?: string) {
		this.reason = reason;
	}
}

function addLeadingZeroes(val: number, totalDigits: number) {
	return (10 ** totalDigits + val).toString().slice(1); // (val: 123, totalDigits: 4), 10^4 + 123 = 10123
}

export function formatTime(ticks: number) {
	const hours = ticks / 36000000000.0;
	const hoursInt = Math.floor(hours);
	const minutes = (hours - hoursInt) * 60;
	const minutesInt = Math.floor(minutes);
	const seconds = (minutes - minutesInt) * 60;
	const secondsInt = Math.floor(seconds);
	const milliseconds = (seconds - secondsInt) * 1000;
	const millisecondsInt = Math.floor(milliseconds);

	return `${hoursInt}:${addLeadingZeroes(minutesInt, 2)}:${addLeadingZeroes(secondsInt, 2)}:${addLeadingZeroes(millisecondsInt, 3)}`;
}
