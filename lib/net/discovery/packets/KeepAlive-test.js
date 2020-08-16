import { assert } from 'chai';
import {
	runToBufferAssertions,
	runFromBufferAssertions
} from './BasePacket-test';

import KeepAlive from './KeepAlive';
import { packetTypes } from './packet-types.js';
import { deviceTypes } from './deviceTypes.js';

describe('net/packets/KeepAlive', function () {
	describe('constructor', function () {
		it('should throw if mac address is not an array', function () {
			assert.throws(() => {
				new KeepAlive('2', 1, '123-456-789-abc-def', [192, 168, 1, 13]);
			});
		});

		it('should throw if ip address is not an array', function () {
			assert.throws(() => {
				new KeepAlive(
					'2',
					1,
					[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
					'192.168.1.100'
				);
			});
		});
	});

	describe('toBuffer()', function () {
		runToBufferAssertions(
			new KeepAlive(
				'whatevz',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[192, 168, 1, 123]
			)
		);

		it('should be 0x36 bytes long', function () {
			const packet = new KeepAlive(
				'whatevz',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[192, 168, 1, 123]
			);
			const actual = packet.toBuffer().length;

			assert.equal(actual, 0x36);
		});

		it('should have type for KeepAlive packets', function () {
			const expected = packetTypes.KEEPALIVE;

			const packet = new KeepAlive(
				'whatevz',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[192, 168, 1, 123]
			);

			const actual = packet.toBuffer()[0x0a];

			assert.equal(actual, expected);
		});

		it('should have the device number at 0x24', function () {
			const expected = 3;

			const packet = new KeepAlive(
				'whatevz',
				expected,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[192, 168, 1, 123]
			);

			const actual = packet.toBuffer()[0x24];

			assert.equal(actual, expected);
		});

		it('should have the mac address starting at 0x26', function () {
			const macAddress = [1, 2, 3, 4, 5, 6];
			const expected = macAddress.slice();

			const packet = new KeepAlive('whatevz', 1, macAddress, [
				192,
				168,
				1,
				123
			]);

			const actual = Array.from(
				packet.toBuffer().slice(0x26, 0x26 + expected.length)
			);

			assert.deepEqual(actual, expected);
		});

		it('should have the ip address starting at 0x2c', function () {
			const ipAddress = [192, 168, 1, 123];
			const expected = ipAddress.slice();

			const packet = new KeepAlive(
				'whatevz',
				expected,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				ipAddress
			);
			const actual = Array.from(
				packet.toBuffer().slice(0x2c, 0x2c + expected.length)
			);

			assert.deepEqual(actual, expected);
		});

		it('should have the device type at 0x25', function () {
			const expected = deviceTypes.MIXER;

			const packet = new KeepAlive(
				'whatevz',
				2,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[192, 168, 1, 123],
				expected
			);
			const actual = packet.toBuffer()[0x25];

			assert.equal(actual, expected);
		});

		it('should have the device type at 0x34', function () {
			const expected = deviceTypes.MIXER;

			const packet = new KeepAlive(
				'whatevz',
				2,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[192, 168, 1, 123],
				expected
			);
			const actual = packet.toBuffer()[0x34];

			assert.equal(actual, expected);
		});

		it('should have the sequence [0x01, 0x00, 0x00, 0x00] starting at byte 0x30', function () {
			const expected = [1, 0, 0, 0];

			const packet = new KeepAlive(
				'whatevz',
				2,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[192, 168, 1, 123],
				deviceTypes.CDJ_XDJ
			);
			const actual = Array.from(
				packet.toBuffer().slice(0x30, 0x30 + expected.length)
			);

			assert.deepEqual(actual, expected);
		});

		it('should have byte 0x35 set to 0x00', function () {
			const expected = 0;

			const packet = new KeepAlive(
				'whatevz',
				2,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[192, 168, 1, 123],
				deviceTypes.CDJ_XDJ
			);
			const actual = packet.toBuffer()[0x35];

			assert.equal(actual, expected);
		});
	});

	describe('fromBuffer', function () {
		const expectedDeviceName = 'Cruella Device';
		runFromBufferAssertions({
			buffer: new KeepAlive(
				expectedDeviceName,
				1,
				[1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1]
			).toBuffer(),
			decodeFn: KeepAlive.fromBuffer,
			expectedDeviceName,
			expectedPacketType: packetTypes.KEEPALIVE
		});

		it('should return an instance of KeepAlive', function () {
			const buffer = new KeepAlive(
				expectedDeviceName,
				1,
				[1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1]
			).toBuffer();

			const actual = KeepAlive.fromBuffer(buffer);

			assert.instanceOf(actual, KeepAlive);
		});

		it('should set device number from packet data', function () {
			const expected = 3;

			const buffer = new KeepAlive(
				'lol',
				expected,
				[1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1]
			).toBuffer();
			const { deviceNumber: actual } = KeepAlive.fromBuffer(buffer);

			assert.equal(actual, expected);
		});

		it('should set mac address from packet data', function () {
			const expected = [0x12, 0x23, 0x34, 0x45, 0x56, 0x67];

			const buffer = new KeepAlive('unf', 1, expected.slice(), [
				1,
				1,
				1,
				1
			]).toBuffer();
			const { macAddress: actual } = KeepAlive.fromBuffer(buffer);

			assert.deepEqual(actual, expected);
		});

		it('should set ip address from packet data', function () {
			const expected = [192, 168, 100, 12];

			const buffer = new KeepAlive(
				'heh',
				1,
				[1, 1, 1, 1, 1, 1],
				expected.slice()
			).toBuffer();
			const { ipAddress: actual } = KeepAlive.fromBuffer(buffer);

			assert.deepEqual(actual, expected);
		});

		it('should set device type from packet data', function () {
			const expected = deviceTypes.MIXER;

			const buffer = new KeepAlive(
				'bah',
				1,
				[1, 1, 1, 1, 1, 1],
				[1, 1, 1, 1],
				expected
			).toBuffer();
			const { deviceType: actual } = KeepAlive.fromBuffer(buffer);

			assert.equal(actual, expected);
		});
	});
});
