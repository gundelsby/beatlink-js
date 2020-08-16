import debug from 'debug';

const logger = debug('beatlink');

/**
 *
 * @param {string} namespace - wanted namespace, typically the name of your module
 *
 * @returns {debug.Debugger}
 */
function getLogger(namespace) {
	return logger.extend(namespace);
}

export { getLogger };
