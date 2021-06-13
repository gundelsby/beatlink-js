/**
 * @typedef {import('../../util/deviceTypes.js').deviceTypes} DeviceType
 */

import { assert } from 'chai';
import { createProLinkHeader } from '../../util/header.js';

import BasePacket from './BasePacket.js';
import { packetTypes } from '../../util/packet-types.js';

export { runToBufferAssertions, runFromBufferAssertions };

describe('net/discovery/packets/BasePacket', function () {
	it('should set a default device name if none is given', function () {
		const actual = new BasePacket(packetTypes.ANNOUNCE);

		assert.isNotEmpty(actual.deviceName);
	});

	it('should set packet type from input', function () {
		const expected = 0x47;

		const actual = new BasePacket(expected);

		assert.equal(actual.packetType, expected);
	});

	describe('toBuffer', function () {
		const packet = new BasePacket(packetTypes.ANNOUNCE, 'device name');

		runToBufferAssertions(packet);

		it('return value should be 0x24 bytes', function () {
			const actual = new BasePacket(
				packetTypes.KEEPALIVE,
				'device name',
				1
			).toBuffer();

			assert.lengthOf(actual, 0x24);
		});
	});

	describe('fromBuffer', function () {
		const expectedPacketType = packetTypes.ANNOUNCE;
		const expectedDeviceName = 'this is what I want';
		const buffer = new BasePacket(
			expectedPacketType,
			expectedDeviceName
		).toBuffer();

		runFromBufferAssertions({
			buffer,
			decodeFn: BasePacket.fromBuffer,
			expectedDeviceName,
			expectedPacketType
		});
	});
});

/**
 * Runs assertions for encoding data that is common for all packets extending
 * the BasePacket class.
 *
 * @param {T extends BasePacket} packet - the packet object to test
 */
function runToBufferAssertions(packet) {
	it('should return a buffer', function () {
		const actual = packet.toBuffer();

		assert.instanceOf(actual, Buffer);
	});

	it('should start with a ProLink header padded with an extra 0 byte', function () {
		const proLinkHeader = createProLinkHeader(packet.packetType);
		const expected = Buffer.concat(
			[proLinkHeader, Buffer.alloc(1)],
			proLinkHeader.length + 1
		);

		const buffer = packet.toBuffer();
		const actual = buffer.slice(0, expected.length);

		assert.deepEqual(actual, expected);
	});

	it('should add the device name starting from byte 0x0c', function () {
		const expected = packet.deviceName;

		const actual = packet
			.toBuffer()
			.slice(0x0c, 0x0c + expected.length)
			.toString();

		assert.equal(actual, expected);
	});

	it('should pad the device name with null bytes for a total length of 0x14', function () {
		const actual = packet
			.toBuffer()
			.slice(0x0c + packet.deviceName.length, 0x0c + 0x14);

		assert.deepStrictEqual(actual, Buffer.alloc(actual.length));
	});

	it('should have have the value 0x01 at byte 0x20', function () {
		const expected = 0x01;

		const actual = packet.toBuffer()[0x20];

		assert.equal(actual, expected);
	});

	it('should have have the value 0x02 at byte 0x21', function () {
		const expected = 0x02;

		const actual = packet.toBuffer()[0x21];

		assert.equal(actual, expected);
	});

	it('should have total packet length as a 16 bit integer at bytes 0x22, 0x23', function () {
		const buffer = packet.toBuffer();
		const expected = buffer.length;

		const actual = buffer.readInt16BE(0x22);

		assert.equal(actual, expected);
	});
}

/**
 * Runs assertions for decoding data that is common for all packets extending
 * the BasePacket class.
 *
 * @param {{buffer: Buffer, decodeFn: function, expectedDeviceName: string, expectedPacketType: DeviceType}} data
 * @param {Buffer} data.buffer - the buffer to decode
 * @param {function} data.decodeFn - the decode function to use. This should be the decode function of the extending class
 * @param {string} data.expectedDeviceName - the expected device name
 * @param {DeviceType} data.expectedPacketType - the expected packet type
 */
function runFromBufferAssertions({
	buffer,
	decodeFn,
	expectedDeviceName,
	expectedPacketType
}) {
	it('should set packet type from packet data', function () {
		const { packetType: actual } = decodeFn(buffer);

		assert.equal(actual, expectedPacketType);
	});

	it('should set device name from from packet data', function () {
		const { deviceName: actual } = decodeFn(buffer);

		assert.equal(actual, expectedDeviceName);
	});
}
