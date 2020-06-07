import { assert } from 'chai';
import { runToBufferAssertions } from './BasePacket-test';

import KeepAlive from './KeepAlive';
import { packetTypes } from './packet-types.js';
import { deviceTypes } from './deviceTypes.js';

describe('net/packets/KeepAlive', () => {
	describe('constructor', () => {
		it('should throw if mac address is not an array', () => {
			assert.throws(() => {
				new KeepAlive('2', 1, '123-456-789-abc-def', [192, 168, 1, 13]);
			});
		});

		it('should throw if ip address is not an array', () => {
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

	describe('toBuffer()', () => {
		runToBufferAssertions(
			new KeepAlive(
				'whatevz',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[192, 168, 1, 123]
			)
		);

		it('should be 0x36 bytes long', () => {
			const packet = new KeepAlive(
				'whatevz',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[192, 168, 1, 123]
			);
			const actual = packet.toBuffer().length;

			assert.equal(actual, 0x36);
		});

		it('should have type for KeepAlive packets', () => {
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

		it('should have the device number at 0x24', () => {
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

		it('should have the mac address starting at 0x26', () => {
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

		it('should have the ip address starting at 0x2c', () => {
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

		it('should have the device type at 0x25', () => {
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

		it('should have the device type at 0x34', () => {
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

		it('should have the sequence [0x01, 0x00, 0x00, 0x00] starting at byte 0x30', () => {
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

		it('should have byte 0x35 set to 0x00', () => {
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
});
