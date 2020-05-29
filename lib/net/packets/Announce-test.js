import { assert } from 'chai';

import Announce from './Announce.js';
import { packetTypes } from './packet-types.js';
import { deviceTypes } from './deviceTypes.js';
import { createProLinkheader } from './headers.js';

describe('net/packets/Announce', () => {
	// These have a data length of 25 bytes, appear roughly every 300 milliseconds, and have the following content:
	// 0123456789abcdef
	// 5173707431576d4a4f4c0a000010Device Name (padded with 00)200102lenp
	// 02
	// Initial announcement packets from mixer.

	// Byte 0a (inside the green header section) is shown in bold because its value changes in the different types of packets that devices send, and can be used to tell them apart.

	it('should set correct packet type for announce packets', () => {
		const expected = packetTypes.ANNOUNCE;

		const actual = new Announce().type;

		assert.equal(actual, expected);
	});

	// The byte following the device name (at byte 20) seems to always have the value 1 in every kind of packet seen. The next byte is in bold as well because it seems to indicate the structure of the remainder of the packet. The value 02 is followed by a two-byte value lenp that indicates the length of the entire packet (including the preceding header bytes), and followed by the payload. In the case of this kind of packet, the length is 0025, and the payload is the single-byte value 02.

	describe('toBuffer', () => {
		it('return value should be 0x25 bytes', () => {
			const actual = new Announce().toBuffer();

			assert.lengthOf(actual, 0x25);
		});

		it('should have a header with correct type for announce packets', () => {
			const type = packetTypes.ANNOUNCE;
			const expected = createProLinkheader(type);

			const actual = new Announce().toBuffer();

			assert.deepEqual(actual.slice(0, expected.length), expected);
		});

		it('should have total packet length as a 16 bit integer at bytes 0x22, 0x23', () => {
			const buffer = new Announce().toBuffer();
			const expected = buffer.length;
			const actual = buffer.readInt16BE(0x22);

			assert.equal(actual, expected);
		});

		it('should set byte 0x24 to the correct value for its device type', () => {
			const deviceType = deviceTypes.CDJ_XDJ;
			const expected = deviceType;

			const buffer = new Announce(deviceType).toBuffer();
			const actual = buffer[0x24];

			assert.equal(actual, expected);
		});
	});
});
