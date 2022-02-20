import { assert } from 'chai';
import { packetTypes } from '../../util/packet-types.js';
import { runToBufferAssertions } from './BasePacket-test.js';

import BeatPacket from './BeatPacket.js';

describe('lib/net/beat-tracking/BeatPacket', function () {
	describe('toBuffer', function () {
		const packet = new BeatPacket(packetTypes.BEAT, 'T-800', 3, 250);

		runToBufferAssertions(packet);

		it('should have a length of 0x5f bytes', function () {
			const actual = packet.toBuffer();

			assert.lengthOf(actual, 0x5f);
		});

		/*nextBeat at bytes 24-27 is the number of milliseconds in which the very 
		next beat will arrive. 2ndBeat (bytes 28-2b) is the number of milliseconds 
		until the beat after that. nextBar (bytes 2c-2f) reports the number of 
		milliseconds until the next measure of music begins, 
		which may be from 1 to 4 beats away. 
		4thBeat (bytes 30-33) reports how many milliseconds will elapse until the 
		fourth upcoming beat; 2ndBar (bytes 34-37) the interval until the second 
		measure after the current one begins (which will occur in 5 to 8 beats, 
		depending how far into the current measure we have reached); 
		and 8thBeat (bytes 38-3b) tells how many millieconds we have to wait 
		until the eighth upcoming beat will arrive.	
	*/

		it('should have the number of milliseconds until next beat at 0x24-0x27', function () {
			const expected = packet.timeUntilNextBeat;

			const actual = packet.toBuffer().readUInt32BE(0x24);

			assert.equal(actual, expected);
		});

		it('should have the device number at 0x5f', function () {
			const expected = packet.deviceNumber;

			const actual = packet.toBuffer()[0x5f];

			assert.equal(actual, expected);
		});
	});
});
