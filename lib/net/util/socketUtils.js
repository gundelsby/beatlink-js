import { createSocket } from 'dgram';
import { getLogger } from '../../util/logger.js';

export { createBoundSocket };

const log = getLogger('lib/net/util/socketUtils');

/**
 * Creates a socket, binds it to a port and returns a promise that resolves
 * when the bind operation has completed.
 *
 * @param {number} port
 * @returns {Promise<import('dgram').Socket>}
 */
async function createBoundSocket(port) {
	const socket = createSocket('udp4');

	return new Promise((resolve, reject) => {
		socket.on('listening', () => {
			log(`Bound socket `, socket.address());
			socket.removeAllListeners();
			resolve(socket);
		});

		socket.on('error', (err) => {
			socket.removeAllListeners();
			log(`Unable to bind socket to port #{port}`, err);
			reject(err.message);
		});

		try {
			socket.bind(port);
		} catch (err) {
			socket.removeAllListeners();
			log(`Unable to bind socket to port #{port}`, err);
			reject(err.message);
		}
	});
}
