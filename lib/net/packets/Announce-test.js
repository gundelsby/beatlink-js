import { assert } from 'chai';
import {
	runToBufferAssertions as runBasetoBufferAssertions,
	runFromBufferAssertions as runBaseFromBufferAssertions
} from './BasePacket-test.js';

import Announce from './Announce.js';
import { packetTypes } from './packet-types.js';
import { deviceTypes } from './deviceTypes.js';

describe('net/packets/Announce', () => {
	it('should set correct packet type for announce packets', () => {
		const expected = packetTypes.ANNOUNCE;

		const actual = new Announce().type;

		assert.equal(actual, expected);
	});

	it('should set device name from argument', () => {
		const expected = 'another device';

		const actual = new Announce(deviceTypes.CDJ_XDJ, expected).deviceName;

		assert.equal(actual, expected);
	});

	describe('toBuffer', () => {
		runBasetoBufferAssertions(
			new Announce(deviceTypes.CDJ_XDJ, 'a device name')
		);

		it('return value should be 0x25 bytes', () => {
			const actual = new Announce().toBuffer();

			assert.lengthOf(actual, 0x25);
		});

		it('should have a header with correct type for announce packets', () => {
			const expected = packetTypes.ANNOUNCE;

			const packet = new Announce();
			const actual = packet.toBuffer()[0x0a];

			assert.deepEqual(actual, expected);
		});

		it('should set byte 0x24 to the correct value for its device type', () => {
			const deviceType = deviceTypes.CDJ_XDJ;
			const expected = deviceType;

			const buffer = new Announce(deviceType).toBuffer();
			const actual = buffer[0x24];

			assert.equal(actual, expected);
		});
	});

	describe('fromBuffer', () => {
		const expectedDeviceName = 'Rene DeVice';

		runBaseFromBufferAssertions({
			buffer: new Announce(0, expectedDeviceName).toBuffer(),
			decodeFn: Announce.fromBuffer,
			expectedPacketType: packetTypes.ANNOUNCE,
			expectedDeviceName
		});

		it('should set device type from packet data', () => {
			const expected = deviceTypes.CDJ_XDJ;

			const buffer = new Announce(expected, 'whatevz').toBuffer();
			const { deviceType: actual } = Announce.fromBuffer(buffer);

			assert.equal(actual, expected);
		});
	});
});
