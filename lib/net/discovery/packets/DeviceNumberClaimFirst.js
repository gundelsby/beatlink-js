/**
 * @typedef {import('../../util/deviceTypes.js').deviceTypes} DeviceType
 */

import BasePacket from './BasePacket.js';
import { packetTypes } from '../../util/packet-types.js';

/**
 * Packet used in the first stage of the device number assign/claim process.
 *
 * In addition to the name and device type (as in the announce packets), this
 * packet also contains the devices's mac address and a counter stating how
 * many times a packet has been broadcasted.
 */
export default class DeviceNumberClaimFirst extends BasePacket {
	/**
	 * Create a packet
	 *
	 * @param {DeviceType} deviceType - the type of device this packet is for (ie CDJ/XDJ)
	 * @param {string} deviceName - the name of the device, max 20 characters
	 * @param {number} broadcastCount - a counter for the amount of times this packet has been broadcast, starting at 1 for the first broadcast
	 * @param {Uint8Array} macAddress - a 6 byte mac address
	 */
	constructor(
		deviceType,
		deviceName,
		broadcastCount = 1,
		macAddress = [0, 0, 0, 0, 0, 0]
	) {
		super(packetTypes.NUMBER_CLAIM_FIRST_STAGE, deviceName);
		this.broadcastCount = broadcastCount;
		this.deviceType = deviceType;
		this.macAddress = macAddress;
	}

	/**
	 * @returns {Buffer} a Buffer representing the packet
	 */
	toBuffer() {
		const header = super.toBuffer();
		const data = Buffer.from([this.broadcastCount, this.deviceType]);
		const macAddress = Buffer.from(this.macAddress);

		const buffer = Buffer.concat([header, data, macAddress]);

		BasePacket.writePacketLength(buffer);
		return buffer;
	}

	/**
	 * Creates a DeviceNumberClaimFirst object from raw packet data.
	 *
	 * @param {Buffer} buffer - the raw packet data
	 *
	 * @returns {DeviceNumberClaimFirst} - the decoded data as a DeviceNumberClaimFirst object
	 */
	static fromBuffer(buffer) {
		const { deviceName } = BasePacket.fromBuffer(buffer);
		const deviceType = buffer[0x25];
		const broadcastCount = buffer[0x24];
		const macAddress = Array.from(buffer.slice(0x26, 0x26 + 6));

		return new DeviceNumberClaimFirst(
			deviceType,
			deviceName,
			broadcastCount,
			macAddress
		);
	}
}
