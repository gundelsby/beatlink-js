import BasePacket from './BasePacket.js';
import { packetTypes } from './packet-types.js';
import { isIpAddress, isMacAddress } from './validators.js';

/**
 * @typedef {import('./deviceTypes.js').deviceTypes} DeviceType
 */

/**
 * Device keepalive packet
 *
 * Broadcasted at regular intervals after device start up is completed.
 *
 */
export default class KeepAlive extends BasePacket {
	/**
	 * Create a packet
	 *
	 * @param {string} deviceName - the name of the device, max 20 characters
	 * @param {*} deviceNumber - the device's assigned number
	 * @param {*} macAddress - the device's MAC address
	 * @param {*} ipAddress - the device's IP address
	 * @param {DeviceType} deviceType - the type of device this packet is for (ie CDJ/XDJ)
	 */
	constructor(deviceName, deviceNumber, macAddress, ipAddress, deviceType) {
		super(packetTypes.KEEPALIVE, deviceName);
		this.deviceNumber = deviceNumber;

		if (!isMacAddress(macAddress)) {
			throw new TypeError(`${macAddress} is not a valid mac address`);
		}
		this.macAddress = macAddress;

		if (!isIpAddress(ipAddress)) {
			throw new TypeError(`${ipAddress} is not a valid IP address`);
		}
		this.ipAddress = ipAddress;

		this.deviceType = deviceType;
	}

	/**
	 * @returns {Buffer} a Buffer representing the packet
	 */
	toBuffer() {
		const header = super.toBuffer();
		const data = Buffer.from([
			this.deviceNumber,
			this.deviceType,
			...this.macAddress,
			...this.ipAddress,
			1,
			0,
			0,
			0,
			this.deviceType
		]);

		const buffer = Buffer.concat([header, data], 0x36);

		BasePacket.writePacketLength(buffer);
		return buffer;
	}

	/**
	 * Creates a KeepAlive object from raw packet data.
	 *
	 * @param {Buffer} buffer - the raw packet data to decode
	 * @returns {KeepAlive} the decoded packet as an Announce object
	 */
	static fromBuffer(buffer) {
		const { deviceName } = BasePacket.fromBuffer(buffer);
		const deviceNumber = buffer[0x24];
		const macAddress = Array.from(buffer.slice(0x26, 0x26 + 6));
		const ipAddress = Array.from(buffer.slice(0x2c, 0x2c + 4));
		const deviceType = buffer[0x25];

		return new KeepAlive(
			deviceName,
			deviceNumber,
			macAddress,
			ipAddress,
			deviceType
		);
	}
}
