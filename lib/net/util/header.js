/**
 * Creates a default Pro Link packet header with the given packet type.
 * The header is always the same, except for [0x0a] which contains the packet
 * type.
 *
 * @param {number} packetTypeValue - the packet type
 * @returns {Buffer} - the packet header as a Buffer
 */
export function createProLinkHeader(packetTypeValue) {
	return Buffer.from([
		0x51,
		0x73,
		0x70,
		0x74,
		0x31,
		0x57,
		0x6d,
		0x4a,
		0x4f,
		0x4c,
		packetTypeValue
	]);
}
