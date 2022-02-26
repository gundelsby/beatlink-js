import BasePacket from './BasePacket.js';
import { packetTypes } from '../../util/packet-types.js';
import {
	convertDecimalPitchPercentageToFourByteValue,
	convertFourBytePitchToDecimalPercentageValue
} from '../helpers/valueConverters.js';

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
		const pitch = createUInt32Buffer(
			convertDecimalPitchPercentageToFourByteValue(this.pitch)
		);
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

	/**
	 * Creates a BeatPacket object from raw packet data.
	 *
	 * @param {Buffer} buffer - the raw packet data
	 *
	 * @returns {BeatPacket} - the decoded data as a BasePacket object
	 */
	static fromBuffer(buffer) {
		const { deviceName, deviceNumber } = BasePacket.fromBuffer(buffer);

		// beats
		const timeUntilNextBeat = buffer.readUInt32BE(0x24);
		const timeUntilSecondNextBeat = buffer.readUInt32BE(0x28);
		const timeUntilFourthNextBeat = buffer.readUInt32BE(0x30);
		const timeUntilEightNextBeat = buffer.readUInt32BE(0x38);

		// bars
		const timeUntilNextBar = buffer.readUInt32BE(0x2c);
		const timeUntilSecondNextBar = buffer.readUInt32BE(0x34);

		const beatInCurrentBar = buffer.readUint8(0x5c);

		// pitch and tempo
		const pitch = convertFourBytePitchToDecimalPercentageValue(
			buffer.readUInt32BE(0x54)
		);
		const bpm = buffer.readUInt16BE(0x5a) / 100;

		return new BeatPacket(
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
		);
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
