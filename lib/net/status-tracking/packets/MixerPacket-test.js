/**
 * @typedef {import('../../util/deviceTypes.js').deviceTypes} DeviceType
 */

import {
	runToBufferAssertions as runBaseToBufferAssertions,
	runFromBufferAssertions as runBaseFromBufferAssertions
} from './BasePacket-test.js';
import { assert } from 'chai';
import MixerPacket from './MixerPacket.js';
import { convertDecimalPitchPercentageToFourByteValue } from '../../beat-tracking/helpers/valueConverters.js';

describe('net/status-tracking/packets/MixerPacket', function () {
	it('should set device number from input', function () {
		const expected = 0x21;

		const { deviceNumber: actual } = new MixerPacket(expected);

		assert.equal(actual, expected);
	});

	it('should set deviceName from input', function () {
		const expected = 'totally legit mixer';

		const { deviceName: actual } = new MixerPacket(0x21, expected);

		assert.equal(actual, expected);
	});

	it('should set sub type 0x00', function () {
		const { subType: actual } = new MixerPacket(0x21, 'lol');

		assert.equal(actual, 0x00);
	});

	it('should set packet type to 0x29', function () {
		const expected = 0x29;

		const { packetType: actual } = new MixerPacket(0x21, 'hehe');

		assert.equal(actual, expected);
	});

	describe('toBuffer', function () {
		const packet = new MixerPacket(0x21, 'some mixer');

		runBaseToBufferAssertions(packet);

		it('should have remaining packet length as a 16 bit integer at bytes 0x22, 0x23', function () {
			const buffer = packet.toBuffer();
			const expected = buffer.length - 0x24;

			const actual = buffer.readInt16BE(0x22);

			assert.equal(actual, expected);
		});

		it('should have have the device number at byte 0x24', function () {
			const expected = packet.deviceNumber;

			const actual = packet.toBuffer()[0x24];

			assert.equal(actual, expected);
		});

		it('should have the value 0x00 at byte 0x25', function () {
			const expected = 0x00;

			const actual = packet.toBuffer()[0x25];

			assert.equal(actual, expected);
		});

		/*
		 * The value marked F at byte 27 is evidently a status flag equivalent
		 * to the CDJ version shown below, although on a mixer the only two
		 * values seen so far are f0 when it is the tempo master, and d0 when
		 * it is not. So evidently the mixer always considers itself to be
		 * playing and synced, but never on-air
		 */
		it('should have the tempo master flag set at 0x27', function () {
			const expected = MixerPacket.tempoMasterStatusCodes.MASTER;

			const actual = new MixerPacket(
				1,
				'tempo master mixer',
				true
			).toBuffer()[0x27];

			assert.equal(actual, expected);
		});

		/*
		 * There are two places that might contain pitch values, bytes 28–2b
		 * and bytes 30–33, but since they always 100000 (or +0%), we can’t
		 * be sure.
		 */
		it('should have pitch at bytes 0x28-0x2b', function () {
			const pitch = 0.0;
			const expected =
				convertDecimalPitchPercentageToFourByteValue(pitch);

			const actual = new MixerPacket(1, 'tempo master mixer', true, pitch)
				.toBuffer()
				.readInt32BE(0x28);

			assert.equal(actual, expected);
		});

		it('should have 0x80 at 0x2c', function () {
			const actual = new MixerPacket(
				1,
				'tempo master mixer',
				true,
				0.0
			).toBuffer()[0x2c];

			assert.equal(actual, 0x80);
		});

		/*
		 * It is a two-byte integer representing one hundred times the current
		 * track BPM. So, the current track BPM value to two decimal places
		 * can be calculated as (only byte offsets are hexadecimal):
		 * ([0x2e] * 256 + [0x2f]) / 100
		 */
		it('should have the bpm value at bytes 0x2e-0x2f', function () {
			const bpm = 174;
			const expected = bpm * 100;

			const packetBuffer = new MixerPacket(
				1,
				'tempo master mixer',
				true,
				0.0,
				bpm
			).toBuffer();
			console.log(
				`Received packetBuffer with length ${packetBuffer.length.toString(
					16
				)} (${packetBuffer.length})`
			);

			console.log('Packet', packetBuffer);
			const actual = packetBuffer.readUInt16BE(0x2e);

			assert.equal(actual, expected);
		});

		/*
		 * There are two places that might contain pitch values, bytes 28–2b
		 * and bytes 30–33, but since they always 100000 (or +0%), we can’t
		 * be sure.
		 */
		it('should have pitch at bytes 0x30-0x33', function () {
			const pitch = 0.0;
			const expected =
				convertDecimalPitchPercentageToFourByteValue(pitch);

			const actual = new MixerPacket(1, 'tempo master mixer', true, pitch)
				.toBuffer()
				.readInt32BE(0x30);

			assert.equal(actual, expected);
		});

		/*
		 * The value at byte 0x36, labeled Mh (master handoff), is used to
		 * hand off the tempo master role. It starts out with the value 00
		 * when there is no Master player, but as soon as one appears it
		 * becomes ff. If the mixer has been the tempo master and it is
		 * currently yielding this role to another player, this value will
		 * be the player number that is becoming tempo master during that
		 * handoff, as described in Tempo Master Handoff.
		 */
		it('should have 0x00 at byte 0x36 when no master player is indicated', function () {
			const expected = 0x00;

			const actual = new MixerPacket(
				1,
				'lol',
				false,
				0.0
			).toBuffer()[0x36];

			assert.equal(actual, expected);
		});

		/* The current beat number within a bar (1, 2, 3 or 4) is sent in
		 * byte 0x37. However, the beat number is not synchronized with the
		 * master player, and these packets do not arrive at the same time as
		 * the beat started anyway, so this value is not useful for much.
		 * The beat number should be determined, when needed, from beat packets
		 * that are sent by the master player.
		 */
	});

	describe('fromBuffer', function () {
		const expectedDeviceName = 'another mixer';
		const expectedDeviceNumber = 2;

		const packet = new MixerPacket(
			expectedDeviceNumber,
			expectedDeviceName
		);

		runBaseFromBufferAssertions({
			buffer: packet.toBuffer(),
			decodeFn: MixerPacket.fromBuffer,
			expectedDeviceName,
			expectedDeviceNumber,
			expectedPacketType: packet.packetType,
			expectedSubType: packet.subType
		});
	});
});
