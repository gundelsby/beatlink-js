export { calcRealBpm };

/**
 * Calculates the actual bpm using a bpm value and a pitch adjustment value
 * as input.
 *
 * @param {number} bpm the original BPM
 * @param {number} pitch the pitch adjustment value
 * @returns number the BPM when pitch adjustment is applied
 */
function calcRealBpm(bpm, pitch) {
	return bpm + bpm * (pitch / 100);
}
