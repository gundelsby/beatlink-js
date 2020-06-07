import BasePacket from './BasePacket.js';
import { packetTypes } from './packet-types.js';
import { isIpAddress, isMacAddress } from './validators.js';

export default class KeepAlive extends BasePacket {
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

	static fromBuffer(buffer) {
		return new KeepAlive(...buffer);
	}
}
