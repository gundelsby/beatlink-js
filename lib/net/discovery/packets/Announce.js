import { packetTypes } from '../../util/packet-types.js';
import BasePacket from './BasePacket.js';

const DEVICE_TYPE_BUFFER_POSITION = 0x24;

/**
 * @typedef {import('../../../devices/deviceTypes.js').deviceTypes} DeviceType
 */

/**
 * Device announcement packet
 *
 * Sent to the network's broadcast address at startup, this is a device's way
 * of announcing to other devices on the network that it's there. This is the
 * first packet a device sends after starting up, and it's sent three times
 * with intervals of 300 ms.
 */
export default class Announce extends BasePacket {
	/**
	 *	Create a packet
	 *
	 * @param {DeviceType} deviceType - the type of device this packet is for (ie CDJ/XDJ)
	 * @param {string} deviceName - the name of the device, max 20 characters
	 */
	constructor(deviceType, deviceName) {
		super(packetTypes.ANNOUNCE, deviceName);
		this.deviceType = deviceType;
	}

	/**
	 * @returns {Buffer} a Buffer representing the packet
	 */
	toBuffer() {
		const buffer = Buffer.concat([super.toBuffer()], 0x25);
		buffer[DEVICE_TYPE_BUFFER_POSITION] = this.deviceType;
		BasePacket.writePacketLength(buffer);
		return buffer;
	}

	/**
	 * Creates an Announce object from raw packet data.
	 *
	 * @param {Buffer} buffer - the raw packet data to decode
	 * @returns {Announce} the decoded packet as an Announce object
	 */
	static fromBuffer(buffer) {
		const { deviceName } = BasePacket.fromBuffer(buffer);
		const deviceType = buffer[DEVICE_TYPE_BUFFER_POSITION];

		return new Announce(deviceType, deviceName);
	}
}
