import { assert } from 'chai';

import {
	runToBufferAssertions as runBasetoBufferAssertions,
	runFromBufferAssertions as runBaseFromBufferAssertions
} from './BasePacket-test.js';
import DeviceNumberClaimFinal from './DeviceNumberClaimFinal';
import { packetTypes } from '../../util/packet-types.js';

describe('net/discovery/packets/DeviceNumberClaimFinal', function () {
	describe('toBuffer', function () {
		runBasetoBufferAssertions(new DeviceNumberClaimFinal());

		it('should have a length of 0x26 bytes', function () {
			const packet = new DeviceNumberClaimFinal('hei', 1, 2);
			const actual = packet.toBuffer().length;

			assert.equal(actual, 0x26);
		});

		it('should have packet type set to for final device number claim stage', function () {
			const expected = packetTypes.NUMBER_CLAIM_THIRD_STAGE;

			const packet = new DeviceNumberClaimFinal();
			const actual = packet.toBuffer()[0x0a];

			assert.equal(actual, expected);
		});

		it('should have the claimed device number at 0x24', function () {
			const expected = 2;

			const packet = new DeviceNumberClaimFinal('whatever', expected);
			const actual = packet.toBuffer()[0x24];

			assert.equal(actual, expected);
		});

		it('should have the packet transmission counter at 0x25', function () {
			const expected = 3;

			const packet = new DeviceNumberClaimFinal('whatever', 2, expected);
			const actual = packet.toBuffer()[0x25];

			assert.equal(actual, expected);
		});
	});

	describe('fromBuffer', function () {
		const expectedDeviceName = 'Rene DeVice';

		runBaseFromBufferAssertions({
			buffer: new DeviceNumberClaimFinal(expectedDeviceName, 1).toBuffer(),
			decodeFn: DeviceNumberClaimFinal.fromBuffer,
			expectedPacketType: packetTypes.NUMBER_CLAIM_THIRD_STAGE,
			expectedDeviceName
		});

		it('should set device number from packet data', function () {
			const expected = 4;

			const buffer = new DeviceNumberClaimFinal('whatevz', expected).toBuffer();
			const { deviceNumber: actual } =
				DeviceNumberClaimFinal.fromBuffer(buffer);

			assert.equal(actual, expected);
		});

		it('should set the packet broadcast count from packet data', function () {
			const expected = 2;

			const buffer = new DeviceNumberClaimFinal('lol', 1, expected).toBuffer();
			const { broadcastCount: actual } =
				DeviceNumberClaimFinal.fromBuffer(buffer);

			assert.equal(actual, expected);
		});
	});
});
