import { getLogger } from '../../util/logger.js';
import { EventEmitter } from 'events';
import { createSocket } from 'dgram';

const log = getLogger('BeatTrackingService');

const BROADCAST_PORT = 50001;

export const eventNames = {};

export default class BeatTrackingService extends EventEmitter {
	constructor() {
		super();
		this.server = createSocket('udp4');
		this.registerEventListeners();
		this.server.bind(BROADCAST_PORT);
	}

	registerEventListeners() {
		this.server.on('error', (err) => {
			// emit error to warn users that the service is dead
			log('server error: %O', { err });
			this.server.close();
		});

		this.server.on('listening', () => {
			const { address, port } = this.server.address();
			log(`Beat tracking service listening on ${address}:${port}`);
		});

		this.server.on('message', (msg) => {
			const packetType = Number(msg[0x0a]);

			log(`Received packet with type ${packetType.toString(16)}`, msg);
		});
	}
}
