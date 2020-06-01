import { assert } from 'chai';

import { runToBufferAssertions } from './BasePacket-test';
import DeviceNumberClaimFinal from './DeviceNumberClaimFinal';
import { packetTypes } from './packet-types.js';

describe('net/packets/DeviceNumberClaimFinal', () => {
	describe('toBuffer', () => {
		runToBufferAssertions(new DeviceNumberClaimFinal());

		it('should have a length of 0x26 bytes', () => {
			const packet = new DeviceNumberClaimFinal('hei', 1, 2);
			const actual = packet.toBuffer().length;

			assert.equal(actual, 0x26);
		});

		it('should have packet type set to for final device number claim stage', () => {
			const expected = packetTypes.NUMBER_CLAIM_THIRD_STAGE;

			const packet = new DeviceNumberClaimFinal();
			const actual = packet.toBuffer()[0x0a];

			assert.equal(actual, expected);
		});

		it('should have the claimed device number at 0x24', () => {
			const expected = 2;

			const packet = new DeviceNumberClaimFinal('whatever', expected);
			const actual = packet.toBuffer()[0x24];

			assert.equal(actual, expected);
		});

		it('should have the packet transmission counter at 0x25', () => {
			const expected = 3;

			const packet = new DeviceNumberClaimFinal('whatever', 2, expected);
			const actual = packet.toBuffer()[0x25];

			assert.equal(actual, expected);
		});
	});
});
