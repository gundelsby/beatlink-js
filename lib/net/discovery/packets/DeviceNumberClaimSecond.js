/**
 * @typedef {import('../../util/deviceTypes.js').deviceTypes} DeviceType
 */
import BasePacket from './BasePacket.js';
import { packetTypes } from '../../util/packet-types.js';
import { isMacAddress, isIpAddress } from '../../util/validators.js';

const AUTO_ASSIGN_TRUE_VALUE = 0x01;
const AUTO_ASSIGN_FALSE_VALUE = 0x02;

/**
 * Packet used in the second stage of the device number assign/claim process.
 *
 * In addition to the data also used in the [first stage packet]{@link DeviceNumberClaimFirst}
 * this packet also contains the device's IP address , the device number the
 * device is trying to claim and a byte indicating if the device is
 * claiming a specific number or using auto-assign.
 */
export default class DeviceNumberClaimSecond extends BasePacket {
	/**
	 * @class
	 * Create a packet
	 *
	 * @param {DeviceType} deviceType - the type of device this packet is for (ie CDJ/XDJ)
	 * @param {string} deviceName - the name of the device, max 20 characters
	 * @param {number} broadcastCount - a counter for the amount of times this packet has been broadcast, starting at 1 for the first broadcast
	 * @param {Uint8Array} macAddress - a 6 byte mac address
	 * @param {Uint8Array} ipAddress - a 4 byte IP address
	 * @param {number} wantedDeviceNumber - the wanted device number
	 * @param {boolean} isAutoAssign - true for auto-assign, false when claiming a specific device number
	 */
	constructor(
		deviceType,
		deviceName,
		broadcastCount = 1,
		macAddress = [0, 0, 0, 0, 0, 0],
		ipAddress = [0, 0, 0, 0],
		wantedDeviceNumber = 0x01,
		isAutoAssign = true
	) {
		if (!isMacAddress(macAddress)) {
			throw new TypeError(`${macAddress} is not a valid mac address`);
		}

		if (!isIpAddress(ipAddress)) {
			throw new TypeError(`${ipAddress} is not a valid IP address`);
		}

		super(packetTypes.NUMBER_CLAIM_SECOND_STAGE, deviceName);
		this.broadcastCount = broadcastCount;
		this.deviceType = deviceType;
		this.macAddress = macAddress;
		this.ipAddress = ipAddress;
		this.wantedDeviceNumber = wantedDeviceNumber;
		this.isAutoAssign = isAutoAssign;
	}

	/**
	 * @returns {Buffer} a Buffer representing the packet
	 */
	toBuffer() {
		const header = super.toBuffer();
		const data = Buffer.from([
			...this.ipAddress,
			...this.macAddress,
			this.wantedDeviceNumber,
			this.broadcastCount,
			this.deviceType,
			this.isAutoAssign === true
				? AUTO_ASSIGN_TRUE_VALUE
				: AUTO_ASSIGN_FALSE_VALUE
		]);

		const buffer = Buffer.concat([header, data], 0x32);
		BasePacket.writePacketLength(buffer);

		return buffer;
	}

	/**
	 * Creates a DeviceNumberClaimSecond object from raw packet data.
	 *
	 * @param {Buffer} buffer - the raw packet data
	 *
	 * @returns {DeviceNumberClaimSecond} - the decoded data
	 */
	static fromBuffer(buffer) {
		const { deviceName } = BasePacket.fromBuffer(buffer);
		const deviceType = buffer[0x30];
		const broadcastCount = buffer[0x2f];
		const macAddress = Array.from(buffer.slice(0x28, 0x28 + 6));
		const ipAddress = Array.from(buffer.slice(0x24, 0x24 + 4));
		const wantedDeviceNumber = buffer[0x2e];
		const isAutoAssign = buffer[0x31] === AUTO_ASSIGN_TRUE_VALUE ? true : false;

		return new DeviceNumberClaimSecond(
			deviceType,
			deviceName,
			broadcastCount,
			macAddress,
			ipAddress,
			wantedDeviceNumber,
			isAutoAssign
		);
	}
}
