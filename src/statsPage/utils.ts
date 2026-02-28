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
