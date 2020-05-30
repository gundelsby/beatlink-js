import { packetTypes } from './packet-types.js';
import BasePacket from './BasePacket.js';

export default class Announce extends BasePacket {
	constructor(deviceType, deviceName) {
		super(packetTypes.ANNOUNCE, deviceName);
		this.deviceType = deviceType;
	}

	toBuffer() {
		const buffer = Buffer.concat([super.toBuffer()], 0x25);
		buffer[0x24] = this.deviceType;
		BasePacket.writePacketLength(buffer);
		return buffer;
	}
}
