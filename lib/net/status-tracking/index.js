import { EventEmitter } from 'events';
import { getLogger } from '../../util/logger.js';
import { packetTypes } from '../util/packet-types.js';
import BasePacket from './packets/BasePacket.js';

const log = getLogger('StatusTrackingService');

export default class StatusTrackingService extends EventEmitter {
	/**
	 *
	 * @param {import('dgram').Socket} deviceStatusSocket
	 */
	constructor(deviceStatusSocket) {
		super();

		this.socket = deviceStatusSocket;
		this.registerEventListeners();
		log('Initialized Device Status Tracking service');
	}

	registerEventListeners() {
		this.socket.on('error', (err) => {
			// emit error to warn users that the service is dead
			log('server error: %O', { err });
			this.socket.close();
		});

		this.socket.on('listening', () => {
			const { address, port } = this.socket.address();
			log(`Device status tracking service listening on ${address}:${port}`);
		});

		this.socket.on('message', (msg) => {
			const packetType = msg.readUInt8(0x0a);
			if (packetType === packetTypes.PLAYER_STATUS) {
				log(
					`Captured player status package with type 0x${packetType.toString(
						16
					)}`,
					{ packet: BasePacket.fromBuffer(msg) }
				);
			}
		});
	}

	shutdown() {
		// deregister event listeners
	}
}
