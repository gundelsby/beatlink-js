import { assert } from 'chai';
import {
	runToBufferAssertions as runBaseToBufferAssertions,
	runFromBufferAssertions as runBaseFromBufferAssertions
} from './BasePacket-test.js';

import DeviceNumberClaimFirst from './DeviceNumberClaimFirst';
import { packetTypes } from './packet-types.js';
import { deviceTypes } from './deviceTypes.js';

describe('net/packets/DeviceNumberClaimFirst', function () {
	it('should set first device number claim type', function () {
		const expected = packetTypes.NUMBER_CLAIM_FIRST_STAGE;

		const actual = new DeviceNumberClaimFirst().type;

		assert.equal(actual, expected);
	});

	describe('toBuffer', function () {
		runBaseToBufferAssertions(
			new DeviceNumberClaimFirst(deviceTypes.CDJ_XDJ, 'hello there')
		);

		it('should have a packet type of 0x00 at 0x0a', function () {
			const packet = new DeviceNumberClaimFirst(deviceTypes.MIXER);
			const actual = packet.toBuffer()[0x0a];

			assert.equal(actual, 0x00);
		});

		it('should have a length of 0x2c', function () {
			const packet = new DeviceNumberClaimFirst(deviceTypes.MIXER);
			const actual = packet.toBuffer();

			assert.equal(actual.length, 0x2c);
		});

		it('should set byte 0x24 to reflect the repetition count from argument', function () {
			const expected = 0x02;

			const packet = new DeviceNumberClaimFirst(
				deviceTypes.CDJ_XDJ,
				'some name',
				expected
			);
			const actual = packet.toBuffer()[0x24];

			assert.equal(actual, expected);
		});

		it('should set byte 0x25 to the device type value', function () {
			const expected = deviceTypes.CDJ_XDJ;

			const packet = new DeviceNumberClaimFirst(expected);
			const actual = packet.toBuffer()[0x25];

			assert.equal(actual, expected);
		});

		it(`should set the packet's originating mac address as 6 bytes starting from 0x26`, function () {
			const expected = [0x01, 0x23, 0x45, 0x67, 0x89, 0xab];

			const packet = new DeviceNumberClaimFirst(
				deviceTypes.MIXER,
				'whatever',
				2,
				expected
			);
			const buffer = packet.toBuffer();
			const actual = Array.from(buffer.slice(0x26, 0x26 + 6));

			assert.deepEqual(actual, expected);
		});
	});

	describe('fromBuffer', function () {
		const expectedDeviceName = 'Miami de Vice';

		it('should return an instance of DeviceNumberClaimFirst', function () {
			const buffer = new DeviceNumberClaimFirst(0, 'hehe').toBuffer();
			const actual = DeviceNumberClaimFirst.fromBuffer(buffer);

			assert.instanceOf(actual, DeviceNumberClaimFirst);
		});

		runBaseFromBufferAssertions({
			buffer: new DeviceNumberClaimFirst(1, expectedDeviceName).toBuffer(),
			decodeFn: DeviceNumberClaimFirst.fromBuffer,
			expectedDeviceName,
			expectedPacketType: packetTypes.NUMBER_CLAIM_FIRST_STAGE
		});

		it('should set device type from packet data', function () {
			const expected = deviceTypes.CDJ_XDJ;

			const buffer = new DeviceNumberClaimFirst(expected, 'lol').toBuffer();
			const { deviceType: actual } = DeviceNumberClaimFirst.fromBuffer(buffer);

			assert.equal(actual, expected);
		});

		it('should set broadcast count from packet data', function () {
			const expected = 2;

			const buffer = new DeviceNumberClaimFirst(0, 'asdf', expected).toBuffer();
			const { broadcastCount: actual } = DeviceNumberClaimFirst.fromBuffer(
				buffer
			);

			assert.equal(actual, expected);
		});

		it('should set mac address from packet data', function () {
			const expected = [0x01, 0x23, 0x45, 0x67, 0x89, 0xab];

			const buffer = new DeviceNumberClaimFirst(
				1,
				'heh',
				1,
				expected.slice()
			).toBuffer();
			const { macAddress: actual } = DeviceNumberClaimFirst.fromBuffer(buffer);

			assert.deepEqual(actual, expected);
		});
	});
});
