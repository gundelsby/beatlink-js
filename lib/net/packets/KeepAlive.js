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
