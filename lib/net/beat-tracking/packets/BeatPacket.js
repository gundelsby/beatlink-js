import BasePacket from './BasePacket.js';
import { packetTypes } from '../../util/packet-types.js';

export default class BeatPacket extends BasePacket {
	constructor(
		deviceName,
		deviceNumber,
		timeUntilNextBeat,
		timeUntilSecondNextBeat,
		timeUntilFourthNextBeat,
		timeUntilEightNextBeat,
		timeUntilNextBar,
		timeUntilSecondNextBar,
		pitch,
		bpm,
		beatInCurrentBar
	) {
		super(packetTypes.BEAT, deviceName, deviceNumber);
		this.timeUntilNextBeat = timeUntilNextBeat;
		this.timeUntilSecondNextBeat = timeUntilSecondNextBeat;
		this.timeUntilFourthNextBeat = timeUntilFourthNextBeat;
		this.timeUntilEightNextBeat = timeUntilEightNextBeat;
		this.timeUntilNextBar = timeUntilNextBar;
		this.timeUntilSecondNextBar = timeUntilSecondNextBar;
		this.pitch = pitch; //TODO: should convert from real decimal value to byte value
		this.bpm = bpm;
		this.beatInCurrentBar = beatInCurrentBar;
	}

	toBuffer() {
		const base = super.toBuffer();

		// beats
		const timeUntilNextBeatBuffer = createUInt32Buffer(this.timeUntilNextBeat);
		const timeUntilSecondNextBeatBuffer = createUInt32Buffer(
			this.timeUntilSecondNextBeat
		);
		const timeUntilFourthNextBeatBuffer = createUInt32Buffer(
			this.timeUntilFourthNextBeat
		);
		const timeUntilEightNextBeat = createUInt32Buffer(
			this.timeUntilEightNextBeat
		);

		//bars
		const timeUntilNextBar = createUInt32Buffer(this.timeUntilNextBar);
		const timeUntilSecondNextBar = createUInt32Buffer(
			this.timeUntilSecondNextBar
		);

		// pitch
		const pitch = createUInt32Buffer(this.pitch);
		const bpm = createUInt16Buffer(this.bpm * 100);

		const data = Buffer.from([
			...timeUntilNextBeatBuffer,
			...timeUntilSecondNextBeatBuffer,
			...timeUntilNextBar,
			...timeUntilFourthNextBeatBuffer,
			...timeUntilSecondNextBar,
			...timeUntilEightNextBeat,
			...Buffer.alloc(0x18, 0xff), // reserved space/padding
			...pitch,
			0x00, // reserved space/padding
			0x00, // reserved space/padding
			...bpm,
			this.beatInCurrentBar,
			0x00, // reserved space/padding
			0x00, // reserved space/padding
			this.deviceNumber
		]);
		const buffer = Buffer.concat([base, data], 0x60);
		buffer.writeUInt16BE(data.length, 0x22);

		return buffer;
	}
}

function createUInt32Buffer(uint) {
	const buf = Buffer.alloc(4);
	buf.writeUInt32BE(uint);

	return buf;
}

function createUInt16Buffer(uint) {
	const buf = Buffer.alloc(2);
	buf.writeUInt16BE(uint);

	return buf;
}
