import { assert } from 'chai';
import { convertDecimalPitchPercentageToFourByteValue } from '../../../calc/calc.js';
import { packetTypes } from '../../util/packet-types.js';
import {
	runToBufferAssertions,
	runFromBufferAssertions
} from './BasePacket-test.js';

import BeatPacket from './BeatPacket.js';

describe('lib/net/beat-tracking/BeatPacket', function () {
	describe('toBuffer', function () {
		const packet = new BeatPacket(
			'T-800',
			3,
			250,
			500,
			1000,
			2000,
			1000,
			2000,
			100,
			120,
			1
		);

		runToBufferAssertions(packet);

		it('should have a length of 0x5f bytes', function () {
			const actual = packet.toBuffer();

			assert.lengthOf(actual, 0x60);
		});

		// nextBeat at bytes 24-27 is the number of milliseconds in which the very
		// next beat will arrive.

		it('should have the number of milliseconds until next beat at 0x24-0x27', function () {
			const expected = packet.timeUntilNextBeat;

			const actual = packet.toBuffer().readUInt32BE(0x24);

			assert.equal(actual, expected);
		});

		// 2ndBeat (bytes 28-2b) is the number of milliseconds
		// until the beat after that.

		it('should have the number of milliseconds until the second next beat at 0x28-0x2b', function () {
			const expected = packet.timeUntilSecondNextBeat;

			const actual = packet.toBuffer().readUInt32BE(0x28);

			assert.equal(actual, expected);
		});

		// 4thBeat (bytes 30-33) reports how many milliseconds will elapse until the
		// fourth upcoming beat;
		it('should have the number of milliseconds until the fourth next beat at 0x30-0x33', function () {
			const expected = packet.timeUntilFourthNextBeat;

			const actual = packet.toBuffer().readUInt32BE(0x30);

			assert.equal(actual, expected);
		});

		// 8thBeat (bytes 38-3b) tells how many millieconds we have to wait
		// until the eighth upcoming beat will arrive.
		it('should have the number of milliseconds until the eigth next beat at 0x38-0x3b', function () {
			const expected = packet.timeUntilEightNextBeat;

			const actual = packet.toBuffer().readUInt32BE(0x38);

			assert.equal(actual, expected);
		});

		// nextBar (bytes 2c-2f) reports the number of
		// milliseconds until the next measure of music begins,
		// which may be from 1 to 4 beats away.
		it('should have the number of millisecond until the second next bar starts at 0x2c-0x2f', function () {
			const expected = packet.timeUntilNextBar;

			const actual = packet.toBuffer().readUInt32BE(0x2c);

			assert.equal(actual, expected);
		});

		// 2ndBar (bytes 34-37) the interval until the second
		// measure after the current one begins (which will occur in 5 to 8 beats,
		// depending how far into the current measure we have reached);
		it('should have the number of millisecond until the second next bar starts at 0x34-0x37', function () {
			const expected = packet.timeUntilSecondNextBar;

			const actual = packet.toBuffer().readUInt32BE(0x34);

			assert.equal(actual, expected);
		});

		it('should have 24 bytes of padding using 0xff as values starting at 0x3c', function () {
			const expected = Buffer.alloc(24, 0xff);

			const actual = packet.toBuffer().slice(0x3c, 0x3c + expected.length);

			assert.deepEqual(actual, expected);
		});

		// The player’s current pitch adjustment[1] can be found in bytes 54–57,
		// labeled Pitch. It represents a four-byte pitch adjustment percentage,
		// where 0x00100000 represents no adjustment (0%), 0x00000000 represents
		// slowing all the way to a complete stop (−100%, reachable only in Wide
		// tempo mode), and 0x00200000 represents playing at double speed (+100%)
		it('should have the current device pitch converted to Pioneer formatted four byte value at bytes 0x54-0x57', function () {
			const expected = Buffer.alloc(4);
			expected.writeUInt32BE(
				convertDecimalPitchPercentageToFourByteValue(packet.pitch)
			);

			const actual = packet.toBuffer().slice(0x54, 0x54 + expected.length);

			assert.deepEqual(actual, expected);
		});

		// reserved/padding
		it('should have two null bytes starting at 0x58', function () {
			const expected = Buffer.alloc(2);

			const actual = packet.toBuffer().slice(0x58, 0x58 + expected.length);

			assert.deepEqual(actual, expected);
		});

		// The current BPM of the track playing on the device[2] can be found at
		// bytes 5a-5b (labeled BPM). It is a two-byte integer representing
		// one hundred times the current track BPM.
		it('should have the bpm * 100 as two bytes at 0x5a', function () {
			const expected = packet.bpm * 100;

			const actual = packet.toBuffer().readUInt16BE(0x5a);

			assert.equal(actual, expected);
		});

		// The counter Bb at byte 5c counts out the beat within each bar,
		// cycling 1 → 2 → 3 → 4 repeatedly
		it('should have the current beat position within the bar at byte 0x5c', function () {
			const expected = packet.beatInCurrentBar;

			const actual = packet.toBuffer()[0x5c];

			assert.equal(actual, expected);
		});

		// reserved/padding
		it('should have two null bytes starting at 0x5d', function () {
			const expected = Buffer.alloc(2);

			const actual = packet.toBuffer().slice(0x5d, 0x5d + expected.length);

			assert.deepEqual(actual, expected);
		});

		it('should have the device number at 0x5f', function () {
			const expected = packet.deviceNumber;

			const actual = packet.toBuffer()[0x5f];

			assert.equal(actual, expected);
		});
	});

	describe('fromBuffer', function () {
		const expectedPacketType = packetTypes.BEAT;
		const expectedDeviceName = 'this is what I want';
		const expectedDeviceNumber = 2;
		const expectedTimeUntilNextBeat = 250;
		const expectedTimeUntilSecondNextBeat = 500;
		const expectedTimeUntilFourthNextBeat = 1000;
		const expectedTimeUntilEigthNextBeat = 2000;
		const expectedTimeUntilNextBar = 1000;
		const expectedTimeUntilSecondNextBar = 2000;
		const expectedPitch = 0;
		const expectedBpm = 120;
		const expectedBeatInCurrentBar = 1;

		const buffer = new BeatPacket(
			expectedDeviceName,
			expectedDeviceNumber,
			expectedTimeUntilNextBeat,
			expectedTimeUntilSecondNextBeat,
			expectedTimeUntilFourthNextBeat,
			expectedTimeUntilEigthNextBeat,
			expectedTimeUntilNextBar,
			expectedTimeUntilSecondNextBar,
			expectedPitch,
			expectedBpm,
			expectedBeatInCurrentBar
		).toBuffer();

		runFromBufferAssertions({
			buffer: buffer.slice(),
			decodeFn: BeatPacket.fromBuffer,
			expectedDeviceName,
			expectedPacketType,
			expectedDeviceNumber
		});

		it('should set time until the next beat', function () {
			const actual = BeatPacket.fromBuffer(buffer.slice()).timeUntilNextBeat;

			assert.equal(actual, expectedTimeUntilNextBeat);
		});

		it('should set time until the second next beat', function () {
			const actual = BeatPacket.fromBuffer(
				buffer.slice()
			).timeUntilSecondNextBeat;

			assert.equal(actual, expectedTimeUntilSecondNextBeat);
		});

		it('should set time until the fourth next beat', function () {
			const actual = BeatPacket.fromBuffer(
				buffer.slice()
			).timeUntilFourthNextBeat;

			assert.equal(actual, expectedTimeUntilFourthNextBeat);
		});

		it('should set the time until the eight next beat', function () {
			const actual = BeatPacket.fromBuffer(
				buffer.slice()
			).timeUntilEightNextBeat;

			assert.equal(actual, expectedTimeUntilEigthNextBeat);
		});

		it('should set the time until the next bar', function () {
			const actual = BeatPacket.fromBuffer(buffer.slice()).timeUntilNextBar;

			assert.equal(actual, expectedTimeUntilNextBar);
		});

		it('should set the time until the second next bar', function () {
			const actual = BeatPacket.fromBuffer(
				buffer.slice()
			).timeUntilSecondNextBar;

			assert.equal(actual, expectedTimeUntilSecondNextBar);
		});

		it('should set the pitch', function () {
			const actual = BeatPacket.fromBuffer(buffer.slice()).pitch;

			assert.equal(actual, expectedPitch);
		});

		it('should set the track bpm', function () {
			const actual = BeatPacket.fromBuffer(buffer.slice()).bpm;

			assert.equal(actual, expectedBpm);
		});

		it('should set the beat position in the current bar', function () {
			const actual = BeatPacket.fromBuffer(buffer.slice()).beatInCurrentBar;

			assert.equal(actual, expectedBeatInCurrentBar);
		});
	});
});
