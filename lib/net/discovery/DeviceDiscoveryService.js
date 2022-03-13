import { EventEmitter } from 'events';

import { getLogger } from '../../util/logger.js';
import { packetTypes } from '../util/packet-types.js';
import Announce from './packets/Announce.js';
import DeviceNumberClaimFinal from './packets/DeviceNumberClaimFinal.js';
import DeviceNumberClaimFirst from './packets/DeviceNumberClaimFirst.js';
import DeviceNumberClaimSecond from './packets/DeviceNumberClaimSecond.js';
import KeepAlive from './packets/KeepAlive.js';
import BasePacket from './packets/BasePacket.js';

const log = getLogger('DeviceDiscoveryService');

export const eventNames = {
	ANNOUNCE: 'announce',
	NUMBER_CLAIM_FIRST_STAGE: 'number_claim_first_stage',
	NUMBER_CLAIM_SECOND_STAGE: 'number_claim_second_stage',
	NUMBER_CLAIM_THIRD_STAGE: 'number_claim_third_stage',
	KEEPALIVE: 'keepalive',
	UNKNOWN: 'unknown'
};

export default class DeviceDiscoveryService extends EventEmitter {
	constructor(discoverySocket) {
		super();

		this.socket = discoverySocket;
		this.registerEventListeners();
	}

	registerEventListeners() {
		this.socket.on('error', (err) => {
			log('server error: %O', { err });
			this.socket.close();
			// emit error to warn users that the service is dead
		});

		this.socket.on('listening', () => {
			const { address, port } = this.socket.address();
			log(`Device discovery service listening on ${address}:${port}`);
			// emit ready? does that even make sense?
		});

		this.socket.on('message', (msg) => {
			// use (msg, rinfo)
			// const { address, port } = rinfo;
			//TODO: verify address against packet data where applicable
			// and port against expected

			const packetType = msg.readUInt8(0x0a);

			switch (packetType) {
				case packetTypes.ANNOUNCE:
					this.emit(eventNames.ANNOUNCE, { packet: Announce.fromBuffer(msg) });
					break;
				case packetTypes.NUMBER_CLAIM_FIRST_STAGE:
					this.emit(eventNames.NUMBER_CLAIM_FIRST_STAGE, {
						packet: DeviceNumberClaimFirst.fromBuffer(msg)
					});
					break;
				case packetTypes.NUMBER_CLAIM_SECOND_STAGE:
					this.emit(eventNames.NUMBER_CLAIM_SECOND_STAGE, {
						packet: DeviceNumberClaimSecond.fromBuffer(msg)
					});
					break;
				case packetTypes.NUMBER_CLAIM_THIRD_STAGE:
					this.emit(eventNames.NUMBER_CLAIM_THIRD_STAGE, {
						packet: DeviceNumberClaimFinal.fromBuffer(msg)
					});
					break;
				case packetTypes.KEEPALIVE:
					this.emit(eventNames.KEEPALIVE, {
						packet: KeepAlive.fromBuffer(msg)
					});
					break;
				default:
					this.emit(eventNames.UNKNOWN, { packet: BasePacket.fromBuffer(msg) });
					log(`Emitted UNKNOWN for packet type ${packetType}`, { msg });
					break;
			}
		});
	}
}
