import { assert } from 'chai';

import BasePacket from './BasePacket.js';
import { packetTypes } from './packet-types.js';
import { createProLinkheader } from './headers.js';

describe('net/packets/BasePacket', () => {
	it('should set a default device name if none is given', () => {
		const actual = new BasePacket(packetTypes.ANNOUNCE);

		assert.isNotEmpty(actual.deviceName);
	});

	describe('toBuffer', () => {
		it('should return a buffer', () => {
			const packet = new BasePacket(packetTypes.ANNOUNCE);

			const actual = packet.toBuffer();

			assert.instanceOf(actual, Buffer);
		});

		it('should return a 0x20 length buffer', () => {
			const packet = new BasePacket(packetTypes.ANNOUNCE);

			const actual = packet.toBuffer();

			assert.equal(actual.length, 0x20);
		});

		it('should start with the packet header', () => {
			const type = packetTypes.ANNOUNCE;
			const expected = createProLinkheader(type);
			const packet = new BasePacket(type);

			const buffer = packet.toBuffer();
			const actual = buffer.slice(0, expected.length);

			assert.deepEqual(actual, expected);
		});

		it('should add the device name starting from byte 0x0c', () => {
			const deviceName = 'device name';
			const packet = new BasePacket(packetTypes.ANNOUNCE, deviceName);

			const actual = packet
				.toBuffer()
				.slice(0x0c, 0x0c + deviceName.length)
				.toString();

			assert.equal(actual, deviceName);
		});

		it('should pad the packet with null bytes', () => {
			const deviceName = 'device name';
			const packet = new BasePacket(packetTypes.ANNOUNCE, deviceName);

			const actual = packet.toBuffer().slice(0x0c + deviceName.length);

			assert.deepStrictEqual(actual, Buffer.alloc(actual.length));
		});
	});
});
