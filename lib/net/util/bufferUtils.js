/**
 * Returns the input buffer as a decoded string, stopping at the first null byte
 *
 * @param {Buffer} buffer - the buffer to decode
 * @returns {string} - the decoded string
 */
export function decodeStringFromBuffer(buffer) {
	const firstNullByte = buffer.findIndex((byte) => byte === 0x00);

	return buffer.slice(0, firstNullByte).toString();
}
