import BasePacket from './BasePacket.js';

export default class BeatPacket extends BasePacket {
	constructor(packetType, deviceName, deviceNumber, timeUntilNextBeat) {
		super(packetType, deviceName, deviceNumber);
		this.timeUntilNextBeat = timeUntilNextBeat;
	}

	toBuffer() {
		const base = super.toBuffer();

		// beats
		const timeUntilNextBeatBuffer = createUInt32Buffer(this.timeUntilNextBeat);

		const data = Buffer.from([timeUntilNextBeatBuffer]);
		const buffer = Buffer.concat([base, data], 0x5f);
		BasePacket.writePacketLength(buffer);

		return buffer;
	}
}

function createUInt32Buffer(uint) {
	const buf = Buffer.alloc(4);
	buf.writeUInt32BE(uint);

	return buf;
}
