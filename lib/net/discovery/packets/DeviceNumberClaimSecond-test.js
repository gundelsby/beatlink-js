import { assert } from 'chai';
import {
	runToBufferAssertions,
	runFromBufferAssertions
} from './BasePacket-test.js';

import DeviceNumberClaimSecond from './DeviceNumberClaimSecond.js';
import { packetTypes } from '../../util/packet-types.js';
import { deviceTypes } from '../../../devices/deviceTypes.js';

describe('net/discover/packets/DeviceNumberClaimSecond', function () {
	describe('constructor', function () {
		it('should set first device number claim type', function () {
			const expected = packetTypes.NUMBER_CLAIM_SECOND_STAGE;

			const actual = new DeviceNumberClaimSecond().packetType;

			assert.equal(actual, expected);
		});

		it('should throw if mac address is not an array', function () {
			assert.throws(() => {
				new DeviceNumberClaimSecond(1, '2', 1, '123-456-789-abc-def');
			});
		});

		it('should throw if ip address is not an array', function () {
			assert.throws(() => {
				new DeviceNumberClaimSecond(
					1,
					'2',
					1,
					[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
					'192.168.1.100'
				);
			});
		});
	});

	describe('toBuffer', function () {
		runToBufferAssertions(
			new DeviceNumberClaimSecond(
				deviceTypes.XDJ_CDJ,
				'Ding',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[127, 0, 0, 1],
				1,
				false
			)
		);

		it('should have a length of 0x32 bytes', function () {
			const packet = new DeviceNumberClaimSecond(deviceTypes.MIXER);

			const actual = packet.toBuffer().length;

			assert.equal(actual, 0x32);
		});

		it('should have a packet type of 0x02 at 0x0a', function () {
			const packet = new DeviceNumberClaimSecond(deviceTypes.MIXER);
			const actual = packet.toBuffer()[0x0a];

			assert.equal(actual, 0x02);
		});

		it('should set a 4 byte ip address starting at byte 0x24', function () {
			const ipAdress = [127, 0, 0, 1];
			const expected = [...ipAdress];

			const packet = new DeviceNumberClaimSecond(
				deviceTypes.CDJ_XDJ,
				'whatever',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				ipAdress
			);
			const actual = packet.toBuffer().slice(0x24, 0x24 + 4);

			assert.deepEqual(Array.from(actual), expected);
		});

		it('should set the device type at byte 0x30', function () {
			const deviceType = deviceTypes.CDJ_XDJ;
			const expected = deviceType;

			const packet = new DeviceNumberClaimSecond(deviceType);
			const actual = packet.toBuffer()[0x30];

			assert.equal(actual, expected);
		});

		it(`should set the packet's originating mac address as 6 bytes starting from 0x28`, function () {
			const macAddress = [0x01, 0x23, 0x45, 0x67, 0x89, 0xab];
			const expected = [...macAddress];

			const packet = new DeviceNumberClaimSecond(
				deviceTypes.MIXER,
				'whatever',
				2,
				macAddress
			);
			const buffer = packet.toBuffer();
			const actual = buffer.slice(0x28, 0x28 + 6);

			assert.deepEqual(Array.from(actual), expected);
		});

		it('should set the wanted device number at byte 0x2e', function () {
			const expected = 2;

			const packet = new DeviceNumberClaimSecond(
				0,
				'whatevz',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[127, 0, 0, 1],
				expected
			);
			const actual = packet.toBuffer()[0x2e];

			assert.equal(actual, expected);
		});

		it('should set the packet transmission counter at byte 0x2f', function () {
			const expected = 3;

			const packet = new DeviceNumberClaimSecond(
				0,
				'whatevz',
				expected,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[127, 0, 0, 1]
			);
			const actual = packet.toBuffer()[0x2f];

			assert.equal(actual, expected);
		});

		// the value of byte 31 has a meaning we didn’t appreciate until now:
		// It has the value 01 when the CDJ is trying to auto-assign a device
		// number, 02 when it it is trying to claim a specific number.
		// We label this value a for “auto-assign”:
		it('should set byte 0x31 to 0x01 when using auto assign mode', function () {
			const expected = 0x01;

			const packet = new DeviceNumberClaimSecond(
				0,
				'whatevz',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[127, 0, 0, 1],
				2,
				true
			);
			const actual = packet.toBuffer()[0x31];

			assert.equal(actual, expected);
		});

		it('should set byte 0x31 to 0x02 when trying to claim a specific number', function () {
			const expected = 0x02;

			const packet = new DeviceNumberClaimSecond(
				0,
				'whatevz',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
				[127, 0, 0, 1],
				3,
				false
			);
			const actual = packet.toBuffer()[0x31];

			assert.equal(actual, expected);
		});
	});

	describe('fromBuffer', function () {
		const expectedDeviceName = 'Cruella deVice';

		it('should return an instance of DeviceNumberClaimSecond', function () {
			const buffer = new DeviceNumberClaimSecond(1, 'hehe').toBuffer();
			const actual = DeviceNumberClaimSecond.fromBuffer(buffer);

			assert.instanceOf(actual, DeviceNumberClaimSecond);
		});

		runFromBufferAssertions({
			buffer: new DeviceNumberClaimSecond(
				1,
				expectedDeviceName
			).toBuffer(),
			decodeFn: DeviceNumberClaimSecond.fromBuffer,
			expectedDeviceName,
			expectedPacketType: packetTypes.NUMBER_CLAIM_SECOND_STAGE
		});

		it('should set deviceType from packet data', function () {
			const expected = deviceTypes.CDJ_XDJ;

			const buffer = new DeviceNumberClaimSecond(
				expected,
				'hehe'
			).toBuffer();
			const { deviceType: actual } =
				DeviceNumberClaimSecond.fromBuffer(buffer);

			assert.equal(actual, expected);
		});

		it('should set broadcast count from packet data', function () {
			const expected = 3;

			const buffer = new DeviceNumberClaimSecond(
				1,
				'asdf',
				expected
			).toBuffer();
			const { broadcastCount: actual } =
				DeviceNumberClaimSecond.fromBuffer(buffer);

			assert.equal(actual, expected);
		});

		it('should set mac address from packet data', function () {
			const expected = [0x01, 0x23, 0x45, 0x67, 0x89, 0xba];

			const buffer = new DeviceNumberClaimSecond(
				0,
				'fdsa',
				2,
				expected.slice()
			).toBuffer();
			const { macAddress: actual } =
				DeviceNumberClaimSecond.fromBuffer(buffer);

			assert.deepEqual(actual, expected);
		});

		it('should set ip address from packet data', function () {
			const expected = [128, 1, 1, 2];

			const buffer = new DeviceNumberClaimSecond(
				0,
				'wasd',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xba],
				expected.slice()
			).toBuffer();
			const { ipAddress: actual } =
				DeviceNumberClaimSecond.fromBuffer(buffer);

			assert.deepEqual(actual, expected);
		});

		it('should set the wanted device number from packet data', function () {
			const expected = 2;

			const buffer = new DeviceNumberClaimSecond(
				0,
				'wasd',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xba],
				[128, 1, 1, 2],
				expected
			).toBuffer();
			const { wantedDeviceNumber: actual } =
				DeviceNumberClaimSecond.fromBuffer(buffer);

			assert.equal(actual, expected);
		});

		it('should set auto assign flag from packet data (test for true)', function () {
			const expected = true;

			const buffer = new DeviceNumberClaimSecond(
				0,
				'wasd',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xba],
				[128, 1, 1, 2],
				1,
				expected
			).toBuffer();
			const { isAutoAssign: actual } =
				DeviceNumberClaimSecond.fromBuffer(buffer);

			assert.strictEqual(actual, expected);
		});

		it('should set auto assign flag from packet data (test for false)', function () {
			const expected = false;

			const buffer = new DeviceNumberClaimSecond(
				0,
				'wasd',
				1,
				[0x01, 0x23, 0x45, 0x67, 0x89, 0xba],
				[128, 1, 1, 2],
				1,
				expected
			).toBuffer();
			const { isAutoAssign: actual } =
				DeviceNumberClaimSecond.fromBuffer(buffer);

			assert.strictEqual(actual, expected);
		});
	});
});
