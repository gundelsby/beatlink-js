import { createProLinkHeader } from '../../util/header.js';
import { decodeStringFromBuffer } from '../../util/bufferUtils.js';

const DEFAULT_DEVICE_NAME = 'beatlinkJS';

const DEVICE_NAME_FIELD_LENGTH = 0x14;
const STRUCTURE_PART_DATA = Buffer.from([0x01, 0x00]);

export default class BasePacket {
	constructor(packetType, deviceName = DEFAULT_DEVICE_NAME, deviceNumber = 1) {
		this.packetType = packetType;
		this.deviceName = deviceName;
		this.deviceNumber = deviceNumber;
	}

	/**
	 * Encode the packet data for transmission.
	 *
	 * @returns {Buffer} a Buffer representing the packet
	 */
	toBuffer() {
		const header = createProLinkHeader(this.packetType);

		const name = Buffer.concat(
			[Buffer.from(this.deviceName)],
			DEVICE_NAME_FIELD_LENGTH
		);
		const packetLengthBytes = Buffer.alloc(0x02);
		const deviceNumber = Buffer.from([this.deviceNumber]);

		const buffer = Buffer.concat([
			header,
			name,
			STRUCTURE_PART_DATA,
			deviceNumber,
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
		const packetType = buffer[0x0a];
		const name = decodeStringFromBuffer(
			buffer.slice(0x0b, 0x0b + DEVICE_NAME_FIELD_LENGTH)
		);
		const deviceNumber = buffer[0x21];

		return new BasePacket(packetType, name, deviceNumber);
	}
}
