import { assert } from 'chai';

import BasePacket from './BasePacket.js';
import { packetTypes } from './packet-types.js';
import { createProLinkheader } from './headers.js';

describe('net/packets/BasePacket', () => {
	it('should set a default device name if none is given', () => {
		const actual = new BasePacket(packetTypes.ANNOUNCE);

		assert.isNotEmpty(actual.deviceName);
	});

	it('should set packet type from input', () => {
		const expected = 0x47;

		const actual = new BasePacket(expected);

		assert.equal(actual.type, expected);
	});

	describe('toBuffer', () => {
		it('should return a buffer', () => {
			const packet = new BasePacket(packetTypes.ANNOUNCE);

			const actual = packet.toBuffer();

			assert.instanceOf(actual, Buffer);
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

		it('should pad the device name with null bytes for a total length of 0x14', () => {
			const deviceName = 'device name';
			const packet = new BasePacket(packetTypes.ANNOUNCE, deviceName);

			const actual = packet
				.toBuffer()
				.slice(0x0c + deviceName.length, 0x0c + 0x14);

			assert.deepStrictEqual(actual, Buffer.alloc(actual.length));
		});

		it('should have have the value 0x01 at byte 0x20', () => {
			const expected = 0x01;

			const actual = new BasePacket(packetTypes.ANNOUNCE).toBuffer();

			assert.equal(actual[0x20], expected);
		});

		it('should have have the value 0x02 at byte 0x21', () => {
			const expected = 0x02;

			const actual = new BasePacket(packetTypes.ANNOUNCE).toBuffer();

			assert.equal(actual[0x21], expected);
		});

		it('should have total packet length as a 16 bit integer at bytes 0x22, 0x23', () => {
			const buffer = new BasePacket(packetTypes.ANNOUNCE).toBuffer();
			const expected = buffer.length;
			const actual = buffer.readInt16BE(0x22);

			assert.equal(actual, expected);
		});
	});
});
