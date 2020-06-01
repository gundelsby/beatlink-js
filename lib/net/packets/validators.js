export { isMacAddress, isIpAddress };

/**
 * Library internal value test for mac adresses, to check if a value adheres
 * to the library standard.
 *
 * The rules are:
 *  - must be an array with a length of 6
 *  - must contain only positive numbers in the 0-255 range
 *
 * @param {*} value - the value to test
 * @returns - true if the value is a correctly formatted mac address, false if not
 */
function isMacAddress(value) {
	if (!Array.isArray(value) || value.length !== 6) {
		return false;
	}

	if (value.some((value) => value < 0 || value > 255)) {
		return false;
	}

	return true;
}

/**
 * Library internal value test for ip adresses, to check if a value adheres
 * to the library standard.
 *
 * The rules are:
 *  - must be an array with a length of 4 (so no IPv6)
 *  - must contain only positive numbers in the 0-255 range
 *
 * @param {*} value - the value to test
 * @returns - true if the value is a correctly formatted mac address, false if not
 */
function isIpAddress(value) {
	if (!Array.isArray(value) || value.length !== 4) {
		return false;
	}

	if (value.some((value) => value < 0 || value > 255)) {
		return false;
	}

	return true;
}
