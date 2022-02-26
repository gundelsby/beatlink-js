import { calcRealBpm } from './tempoCalculations.js';
import { assert } from 'chai';

describe('lib/helpers/tempoCalculations', function () {
	describe('calcRealBpm', function () {
		it('should be 136 for a bpm of 136 with pitchAdjustment at 0}', function () {
			const actual = calcRealBpm(136, 0);

			assert.equal(actual, 136);
		});

		it('should be 137.3872 for a bpm of 136 with pitchAdjustment at +1.02}', function () {
			const actual = calcRealBpm(136, 1.02);

			assert.equal(actual, 137.3872);
		});

		it('should be 140.8416 for a bpm of 136 with pitch adjustment at +3.56', function () {
			const actual = calcRealBpm(136, 3.56);

			assert.equal(actual, 140.8416);
		});

		it('should be 130.6144 for a bpm of 136 with pitch adjustment at -3.96', function () {
			const actual = calcRealBpm(136, -3.96);

			assert.equal(actual, 130.6144);
		});
	});
});
