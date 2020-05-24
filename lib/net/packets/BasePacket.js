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
		this.header = createProLinkheader(type);
		this.deviceName = deviceName;
	}

	/**
	 * @returns {Buffer} a Buffer representing the packet
	 */
	toBuffer() {
		const name = Buffer.from(this.deviceName);
		return Buffer.concat([this.header, name], 0x20);
	}
}
