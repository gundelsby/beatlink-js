const DEFAULT_DEVICE_NAME = 'beatlinkJS';

const DEVICE_NAME_FIELD_LENGTH = 0x14;
const STRUCTURE_PART_DATA = [0x01, 0x02];

/**
 * Base packet class. Represents the packet header and the device name.
 */
export default class BasePacket {
	/**
	 *	Create a base packet.
	 *
	 * @param {number} type - packet type
	 * @param {string} [deviceName] - can not be longer than 20 characters
	 */
	constructor(type, deviceName = DEFAULT_DEVICE_NAME) {
		this.type = type;
		this.deviceName = deviceName;
		this.header = createProLinkHeader(type);
	}

	/**
	 * Encode the packet data for transmission.
	 *
	 * @returns {Buffer} a Buffer representing the packet
	 */
	toBuffer() {
		const name = Buffer.concat(
			[Buffer.from(this.deviceName)],
			DEVICE_NAME_FIELD_LENGTH
		);
		const structure = Buffer.from(STRUCTURE_PART_DATA);
		const packetLengthBytes = Buffer.alloc(0x02);

		const buffer = Buffer.concat([
			this.header,
			name,
			structure,
			packetLengthBytes
		]);

		BasePacket.writePacketLength(buffer);
		return buffer;
	}

	/**
	 * Calculates and writes the packet length to the correct position. Convenience
	 * function that can be used in implementing classes.
	 * This function modifies the input value!
	 *
	 * @param {Buffer} buffer
	 */
	static writePacketLength(buffer) {
		buffer.writeInt16BE(buffer.length, 0x22);
	}

	/**
	 * Creates a BasePacket object from raw packet data.
	 *
	 * @param {Buffer} buffer - the raw packet data
	 *
	 * @returns {BasePacket} - the decoded data as a BasePacket object
	 */
	static fromBuffer(buffer) {
		const type = buffer[0x0a];
		const name = decodeStringFromBuffer(
			buffer.slice(0x0c, 0x0c + DEVICE_NAME_FIELD_LENGTH)
		);

		return new BasePacket(type, name);
	}
}

/**
 * Creates a default Pro Link packet header with the given packet type.
 * The header is always the same, except for [0x0a] which contains the packet
 * type.
 *
 * @param {number} packetTypeValue - the packet type
 * @returns {Buffer} - the packet header as a Buffer
 */
function createProLinkHeader(packetTypeValue) {
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
		packetTypeValue,
		0x00
	]);
}

/**
 * Returns the input buffer as a decoded string, stopping at the first null byte
 *
 * @param {Buffer} buffer - the buffer to decode
 * @returns {string} - the decoded string
 */
function decodeStringFromBuffer(buffer) {
	const firstNullByte = buffer.findIndex((byte) => byte === 0x00);

	return buffer.slice(0, firstNullByte).toString();
}
