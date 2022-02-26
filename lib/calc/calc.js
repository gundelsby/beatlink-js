export {
	convertDecimalPitchPercentageToFourByteValue,
	convertFourBytePitchToDecimalPercentageValue
};

function convertDecimalPitchPercentageToFourByteValue(pitch) {
	return (pitch / 100) * 0x100000 + 0x100000;
}

function convertFourBytePitchToDecimalPercentageValue(pitch) {
	return ((pitch - 0x100000) / 0x100000) * 100.0;
}
