/**
 * @typedef {number} PacketType
 **/

/**
 * Packet types used in the DJ Link protocol
 */

// Device discovery (UDP:50000)
/** Initial device announcement */
const ANNOUNCE = 0x0a;
/** First stage device number claim */
const NUMBER_CLAIM_FIRST_STAGE = 0x00;
/** Second stage device number claim */
const NUMBER_CLAIM_SECOND_STAGE = 0x02;
/** Third (final) stage device number claim*/
const NUMBER_CLAIM_THIRD_STAGE = 0x04;
/** Keepalive */
const KEEPALIVE = 0x06;

// Beat sync/mixer control (UDP:50001)
/** Beat */
const BEAT = 0x28;

// Device status (UDP:50002)
/** Media player device status */
const PLAYER_STATUS = 0x0a;
const MIXER_STATUS = 0x29;

/**
 * Enum for packet types
 *
 * @readonly
 * @enum {PacketType}
 */
export const packetTypes = {
	ANNOUNCE,
	NUMBER_CLAIM_FIRST_STAGE,
	NUMBER_CLAIM_SECOND_STAGE,
	NUMBER_CLAIM_THIRD_STAGE,
	KEEPALIVE,
	BEAT,
	PLAYER_STATUS,
	MIXER_STATUS
};
