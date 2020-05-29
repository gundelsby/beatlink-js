export { deviceTypes };

/**
 * @typedef {number} DeviceType
 **/

/**
 * Enum for packet types
 *
 * @readonly
 * @enum {DeviceType}
 */
const deviceTypes = {
	/** Mixer */
	Mixer: 0x02,
	/** CDJ/XDJ */
	CDJ_XDJ: 0x01
};
