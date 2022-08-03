import { assert } from 'chai';
import {
	convertDecimalPitchPercentageToFourByteValue,
	convertFourBytePitchToDecimalPercentageValue
} from './valueConverters.js';

describe('lib/calc/calc', function () {
	describe('convertDecimalPitchToFourByteValue', function () {
		it('should return 0x00000000 for -100.0', function () {
			const actual = convertDecimalPitchPercentageToFourByteValue(-100.0);

			assert.equal(actual, 0x00000000);
		});

		it('should return 0x00100000 for 0', function () {
			const actual = convertDecimalPitchPercentageToFourByteValue(0.0);

			assert.equal(actual, 0x00100000);
		});

		it('should return 0x00200000 for 100.0', function () {
			const actual = convertDecimalPitchPercentageToFourByteValue(100.0);

			assert.equal(actual, 0x00200000);
		});
	});

	describe('convertFourBytePitchToDecimalPercentageValue', function () {
		// The player’s current pitch adjustment[1] can be found in bytes 54–57,
		// labeled Pitch. It represents a four-byte pitch adjustment percentage,
		// where 0x00100000 represents no adjustment (0%), 0x00000000 represents
		// slowing all the way to a complete stop (−100%, reachable only in Wide
		// tempo mode), and 0x00200000 represents playing at double speed (+100%).

		// The pitch adjustment percentage represented by Pitch is calculated by
		// multipyling the following (hexadecimal) equation by decimal 100:

		// ((byte[55] * 10000 = byte[56] * 100 + byte[57]) - 10000)/10000

		it('should return -100.0 for 0x00000000', function () {
			const actual =
				convertFourBytePitchToDecimalPercentageValue(0x00000000);

			assert.equal(actual, -100.0);
		});

		it('should return 0 for 0x00100000', function () {
			const actual =
				convertFourBytePitchToDecimalPercentageValue(0x00100000);

			assert.equal(actual, 0.0);
		});

		it('should return 100.0 for 0x00200000', function () {
			const actual =
				convertFourBytePitchToDecimalPercentageValue(0x00100000);

			assert.equal(actual, 0.0);
		});
	});
});
