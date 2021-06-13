import { createProLinkHeader } from '../../util/header.js';
import { decodeStringFromBuffer } from '../../util/bufferUtils.js';

const DEFAULT_DEVICE_NAME = 'beatlinkJS';

const DEVICE_NAME_FIELD_LENGTH = 0x14;
const STRUCTURE_PART_DATA = Buffer.from([0x01, 0x02]);

/**
 * Base packet class. Represents the packet header and the device name.
 */
export default class BasePacket {
	/**
	 *	Create a base packet.
	 *
	 * @param {number} packetType - packet type
	 * @param {string} [deviceName] - can not be longer than 20 characters
	 */
	constructor(packetType, deviceName = DEFAULT_DEVICE_NAME) {
		this.packetType = packetType;
		this.deviceName = deviceName;
		// discovery packets have an extra 0 byte at the end of the header
	}

	/**
	 * Encode the packet data for transmission.
	 *
	 * @returns {Buffer} a Buffer representing the packet
	 */
	toBuffer() {
		const proLinkHeader = createProLinkHeader(this.packetType);

		const header = Buffer.concat([proLinkHeader], proLinkHeader.length + 1);
		const name = Buffer.concat(
			[Buffer.from(this.deviceName)],
			DEVICE_NAME_FIELD_LENGTH
		);
		const packetLengthBytes = Buffer.alloc(0x02);

		const buffer = Buffer.concat([
			header,
			name,
			STRUCTURE_PART_DATA,
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
