import { createProLinkHeader } from '../../util/header.js';
import { decodeStringFromBuffer } from '../../util/bufferUtils.js';

const DEFAULT_DEVICE_NAME = 'beatlinkJS';

const DEVICE_NAME_FIELD_LENGTH = 0x14;
const PACKET_LENGTH_BUFFER_POSITION = 0x22;

// Placeholder constants
const PACKET_SUBTYPE = 0x03;

export default class BasePacket {
	constructor(packetType, deviceNumber, deviceName = DEFAULT_DEVICE_NAME) {
		this.packetType = packetType;
		this.deviceName = deviceName;
		this.deviceNumber = deviceNumber;
	}

	toBuffer() {
		const header = createProLinkHeader(this.packetType);
		const name = Buffer.concat(
			[Buffer.from(this.deviceName)],
			DEVICE_NAME_FIELD_LENGTH
		);

		const buffer = Buffer.concat([
			header,
			name,
			Buffer.from([
				0x01,
				PACKET_SUBTYPE,
				this.deviceNumber,
				0x00,
				0x00,
				this.deviceNumber
			])
		]);

		// write packet length
		buffer.writeInt16BE(buffer.length, PACKET_LENGTH_BUFFER_POSITION);

		return buffer;
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
		const number = buffer[0x21];
		const name = decodeStringFromBuffer(
			buffer.slice(0x0b, 0x0b + DEVICE_NAME_FIELD_LENGTH)
		);

		return new BasePacket(type, number, name);
	}
}
