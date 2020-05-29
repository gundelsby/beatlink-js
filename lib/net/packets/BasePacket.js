import { createProLinkheader } from './headers.js';

const DEFAULT_DEVICE_NAME = 'beatlinkJS';

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
		this.header = createProLinkheader(type);
	}

	/**
	 * @returns {Buffer} a Buffer representing the packet
	 */
	toBuffer() {
		const name = Buffer.concat([Buffer.from(this.deviceName)], 0x14);
		const structure = Buffer.from([0x01, 0x02]);
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
}
