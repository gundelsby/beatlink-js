import BasePacket from './BasePacket';
import { packetTypes } from './packet-types.js';

export default class DeviceNumberClaimFirst extends BasePacket {
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

	toBuffer() {
		const header = super.toBuffer();
		const data = Buffer.from([this.broadcastCount, this.deviceType]);
		const macAddress = Buffer.from(this.macAddress);

		const buffer = Buffer.concat([header, data, macAddress]);

		BasePacket.writePacketLength(buffer);
		return buffer;
	}
}
