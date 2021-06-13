import BasePacket from './BasePacket.js';
import { packetTypes } from '../../util/packet-types.js';

/**
 * Packet used for the third and final stage of the device number claim process.
 */
export default class DeviceNumberClaimFinal extends BasePacket {
	/**
	 *
	 * @param {string} deviceName - the name of the device, max 20 characters
	 * @param {number} deviceNumber - the claimed device number
	 * @param {number} broadcastCount - a counter for the amount of times this packet has been broadcast, starting at 1 for the first broadcast
	 */
	constructor(deviceName, deviceNumber, broadcastCount = 1) {
		super(packetTypes.NUMBER_CLAIM_THIRD_STAGE, deviceName);
		this.deviceNumber = deviceNumber;
		this.broadcastCount = broadcastCount;
	}

	toBuffer() {
		const header = super.toBuffer();
		const data = Buffer.from([this.deviceNumber, this.broadcastCount]);

		const buffer = Buffer.concat([header, data], 0x26);
		BasePacket.writePacketLength(buffer);

		return buffer;
	}

	/**
	 * Creates a DeviceNumberClaimFinal object from raw packet data.
	 *
	 * @param {Buffer} buffer - the raw packet data
	 * @returns {DeviceNumberClaimFinal} - the decoded packet object
	 */
	static fromBuffer(buffer) {
		const { deviceName } = BasePacket.fromBuffer(buffer);
		const deviceNumber = buffer[0x24];
		const broadcastCount = buffer[0x25];

		return new DeviceNumberClaimFinal(deviceName, deviceNumber, broadcastCount);
	}
}
