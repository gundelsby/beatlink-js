import { getLogger } from '../../util/logger.js';
import { EventEmitter } from 'events';
import { packetTypes } from '../util/packet-types.js';
import BeatPacket from './packets/BeatPacket.js';
import BasePacket from './packets/BasePacket.js';

const log = getLogger('BeatTrackingService');

export const eventNames = {
	BEAT: 'beat',
	UNKNOWN: 'unknown'
};

export default class BeatTrackingService extends EventEmitter {
	constructor(deviceStatusSocket) {
		super();

		this.socket = deviceStatusSocket;
		this.registerEventListeners();
	}

	registerEventListeners() {
		this.socket.on('error', (err) => {
			// emit error to warn users that the service is dead
			log('server error: %O', { err });
			this.socket.close();
		});

		this.socket.on('listening', () => {
			const { address, port } = this.socket.address();
			log(`Beat tracking service listening on ${address}:${port}`);
		});

		this.socket.on('message', (msg) => {
			const packetType = msg.readUInt8(0x0a);
			log(
				`Emitting captured beat with type 0x${packetType.toString(16)}`
			);
			log(
				`${packetTypes.BEAT} === ${packetType} ? ${
					packetTypes.BEAT === packetType
				}`
			);

			switch (packetType) {
				case packetTypes.BEAT:
					this.emit(eventNames.BEAT, {
						packet: BeatPacket.fromBuffer(msg)
					});
					break;
				default:
					this.emit(eventNames.UNKNOWN, {
						packet: BasePacket.fromBuffer(msg)
					});
			}
		});
	}
}
