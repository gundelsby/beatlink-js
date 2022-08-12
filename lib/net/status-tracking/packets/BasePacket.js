import { createProLinkHeader } from '../../util/header.js';
import { decodeStringFromBuffer } from '../../util/bufferUtils.js';
import { Buffer } from 'buffer';

const DEFAULT_DEVICE_NAME = 'beatlinkJS';

const DEVICE_NAME_FIELD_LENGTH = 0x14;

export default class BasePacket {
	constructor(
		packetType,
		subType,
		deviceNumber,
		deviceName = DEFAULT_DEVICE_NAME
	) {
		this.packetType = packetType;
		this.subType = subType;
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

		return Buffer.concat([
			header,
			name,
			Buffer.from([0x01, this.subType, this.deviceNumber])
		]);
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
		const subType = buffer[0x20];
		const deviceNumber = buffer[0x21];
		const name = decodeStringFromBuffer(
			buffer.slice(0x0b, 0x0b + DEVICE_NAME_FIELD_LENGTH)
		);

		return new BasePacket(type, subType, deviceNumber, name);
	}
}
