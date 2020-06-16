import { assert } from 'chai';

import BasePacket from './BasePacket.js';
import { packetTypes } from './packet-types.js';

export { runToBufferAssertions };

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
		const packet = new BasePacket(packetTypes.ANNOUNCE, 'device name');

		runToBufferAssertions(packet);

		it('return value should be 0x24 bytes', () => {
			const actual = new BasePacket(
				packetTypes.KEEPALIVE,
				'device name'
			).toBuffer();

			assert.lengthOf(actual, 0x24);
		});
	});

	describe('fromBuffer', () => {
		it('should set packet type from packet data', () => {
			const expected = packetTypes.ANNOUNCE;

			const buffer = new BasePacket(expected, 'lol').toBuffer();
			const { type: actual } = BasePacket.fromBuffer(buffer);

			assert.equal(actual, expected);
		});

		it('should set device name from from packet data', () => {
			const expected = 'this is what I want';

			const buffer = new BasePacket(packetTypes.ANNOUNCE, expected).toBuffer();
			const { deviceName: actual } = BasePacket.fromBuffer(buffer);

			assert.equal(actual, expected);
		});
	});
});

function runToBufferAssertions(packet) {
	it('should return a buffer', () => {
		const actual = packet.toBuffer();

		assert.instanceOf(actual, Buffer);
	});

	it('should start with the packet header', () => {
		const header = [
			0x51,
			0x73,
			0x70,
			0x74,
			0x31,
			0x57,
			0x6d,
			0x4a,
			0x4f,
			0x4c,
			packet.type,
			0x00
		];
		const expected = Buffer.from(header);

		const buffer = packet.toBuffer();
		const actual = buffer.slice(0, expected.length);

		assert.deepEqual(actual, expected);
	});

	it('should add the device name starting from byte 0x0c', () => {
		const expected = packet.deviceName;

		const actual = packet
			.toBuffer()
			.slice(0x0c, 0x0c + expected.length)
			.toString();

		assert.equal(actual, expected);
	});

	it('should pad the device name with null bytes for a total length of 0x14', () => {
		const actual = packet
			.toBuffer()
			.slice(0x0c + packet.deviceName.length, 0x0c + 0x14);

		assert.deepStrictEqual(actual, Buffer.alloc(actual.length));
	});

	it('should have have the value 0x01 at byte 0x20', () => {
		const expected = 0x01;

		const actual = packet.toBuffer()[0x20];

		assert.equal(actual, expected);
	});

	it('should have have the value 0x02 at byte 0x21', () => {
		const expected = 0x02;

		const actual = packet.toBuffer()[0x21];

		assert.equal(actual, expected);
	});

	it('should have total packet length as a 16 bit integer at bytes 0x22, 0x23', () => {
		const buffer = packet.toBuffer();
		const expected = buffer.length;

		const actual = buffer.readInt16BE(0x22);

		assert.equal(actual, expected);
	});
}
