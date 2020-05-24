export { packetTypes };

/**
 * @typedef {number} PacketType
 **/

/**
 * Enum for packet types
 *
 * @readonly
 * @enum {PacketType}
 */
const packetTypes = {
	/** Initial device announcement */
	ANNOUNCE: 0x0a,
	/** First stage device number claim */
	NUMBER_CLAIM_FIRST_STAGE: 0x00,
	/** Second stage device number claim */
	NUMBER_CLAIM_SECOND_STAGE: 0x02,
	/** Third (final) stage device number claim*/
	NUMBER_CLAIM_THIRD_STAGE: 0x04,
	/** Keepalive */
	KEEPALIVE: 0x06
};
