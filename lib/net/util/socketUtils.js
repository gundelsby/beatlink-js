import { createSocket } from 'dgram';
import os from 'os';
import { getLogger } from '../../util/logger.js';

export { createBoundSocket, findMacAddress };

const log = getLogger('lib/net/util/socketUtils');

/**
 * Creates a socket, binds it to a port and an optional address and returns
 * a promise that resolves when the bind operation has completed.
 *
 * @param {number} port
 * @param {string?} address - the ip address to bind to
 * @returns {Promise<import('dgram').Socket>}
 */
async function createBoundSocket(port, address) {
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
			socket.bind(port, address ?? undefined);
		} catch (err) {
			socket.removeAllListeners();
			log(`Unable to bind socket to port #{port}`, err);
			reject(err.message);
		}
	});
}

/**
 * Returns the MAC address for the interface which corresponds with the IP
 * address the socket is bound to. If the socket is bound to 0.0.0.0 undefined
 * is returned.
 *
 * @param {import('dgram').Socket} socket - IPv4 address for the interface to find the mac address for
 * @returns {number[]|undefined} the macAddress if found, null if not interface with the given IP address is present on the local computer
 * @throws {Error} if the given IP address is not a valid IPv4 address
 */
function findMacAddress(socket) {
	const ipAddressStr = socket.address().address;

	const interfaces = os.networkInterfaces();

	log(`Trying to find mac address for ${ipAddressStr}`, interfaces);

	for (const id in interfaces) {
		const bindings = interfaces[id];
		for (const binding of bindings) {
			if (binding.family === 'IPv4' && binding.address === ipAddressStr) {
				log(`Found mac address for ${ipAddressStr}: ${binding.mac}`);
				return binding.mac.split(':').map((n) => Number.parseInt(n, 16));
			}
		}
	}
}
