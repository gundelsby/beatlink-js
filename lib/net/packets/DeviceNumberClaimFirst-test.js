import { assert } from 'chai';
import { runToBufferAssertions } from './BasePacket-test.js';

import DeviceNumberClaimFirst from './DeviceNumberClaimFirst';
import { packetTypes } from './packet-types.js';
import { deviceTypes } from './deviceTypes.js';

describe('net/packets/DeviceNumberClaimFirst', () => {
	it('should set first device number claim type', () => {
		const expected = packetTypes.NUMBER_CLAIM_FIRST_STAGE;

		const actual = new DeviceNumberClaimFirst().type;

		assert.equal(actual, expected);
	});

	describe('toBuffer', () => {
		runToBufferAssertions(
			new DeviceNumberClaimFirst(deviceTypes.CDJ_XDJ, 'hello there')
		);

		it('should have a packet type of 0x00 at 0x0a', () => {
			const packet = new DeviceNumberClaimFirst(deviceTypes.MIXER);
			const actual = packet.toBuffer()[0x0a];

			assert.equal(actual, 0x00);
		});

		it('should have a length of 0x2c', () => {
			const packet = new DeviceNumberClaimFirst(deviceTypes.MIXER);
			const actual = packet.toBuffer();

			assert.equal(actual.length, 0x2c);
		});

		it('should set byte 0x24 to reflect the repetition count from argument', () => {
			const expected = 0x02;

			const packet = new DeviceNumberClaimFirst(
				deviceTypes.CDJ_XDJ,
				'some name',
				expected
			);
			const actual = packet.toBuffer()[0x24];

			assert.equal(actual, expected);
		});

		it('should set byte 0x25 to the device type value', () => {
			const expected = deviceTypes.CDJ_XDJ;

			const packet = new DeviceNumberClaimFirst(expected);
			const actual = packet.toBuffer()[0x25];

			assert.equal(actual, expected);
		});

		it(`should set the packet's originating mac address as 6 bytes starting from 0x26`, () => {
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
});
