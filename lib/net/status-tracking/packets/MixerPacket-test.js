/**
 * @typedef {import('../../util/deviceTypes.js').deviceTypes} DeviceType
 */

import {
	runToBufferAssertions as runBaseToBufferAssertions,
	runFromBufferAssertions as runBaseFromBufferAssertions
} from './BasePacket-test.js';
import { assert } from 'chai';
import MixerPacket from './MixerPacket.js';

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
