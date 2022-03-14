import { EventEmitter } from 'events';

import { getLogger } from '../../util/logger.js';
import { packetTypes } from '../util/packet-types.js';
import Announce from './packets/Announce.js';
import DeviceNumberClaimFinal from './packets/DeviceNumberClaimFinal.js';
import DeviceNumberClaimFirst from './packets/DeviceNumberClaimFirst.js';
import DeviceNumberClaimSecond from './packets/DeviceNumberClaimSecond.js';
import KeepAlive from './packets/KeepAlive.js';
import BasePacket from './packets/BasePacket.js';
import { setTimeout } from 'timers/promises';
import { DISCOVERY_PORT } from '../index.js';
import { isIpAddress } from '../util/validators.js';

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
	/**
	 *
	 * @param {import('dgram').Socket} discoverySocket
	 */
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

	/**
	 * Tries to claim the given device number for the given device on this service's network.
	 *
	 * @param {import('../../devices/Device.js').default} device
	 * @param {number} desiredDeviceNumber
	 * @param {number[]} ipAddress - the ip address belonging to the device
	 * @returns {boolean} - true if the claim was successful, false if not
	 * @throws {Error} - on error in input data, check the error message
	 */
	async claimDeviceNumber(device, desiredDeviceNumber, ipAddress) {
		//https://djl-analysis.deepsymmetry.org/djl-analysis/startup.html#cdj-startup
		if (!isIpAddress(ipAddress)) {
			throw new Error(`${ipAddress} is not a valid IP address`);
		}

		// send announce packet 3 times, 300 ms between each
		const announcePacket = new Announce(device.type, device.name).toBuffer();
		for (let i = 0; i < 3; i++) {
			await setTimeout(
				300,
				this.socket.send(announcePacket, DISCOVERY_PORT, '255.255.255.255')
			);
		}

		// send 3 first stage claim packets
		for (let i = 0; i < 3; i++) {
			const packet = new DeviceNumberClaimFirst(
				device.type,
				device.name,
				i + 1,
				device.macAddress
			).toBuffer();
			await setTimeout(
				300,
				this.socket.send(packet, DISCOVERY_PORT, '255.255.255.255')
			);
		}

		// send 3 second stage claim packets
		for (let i = 0; i < 3; i++) {
			const packet = new DeviceNumberClaimSecond(
				device.type,
				device.name,
				i + 1,
				device.macAddress,
				ipAddress,
				desiredDeviceNumber,
				false
			).toBuffer();
			await setTimeout(
				300,
				this.socket.send(packet, DISCOVERY_PORT, '255.255.255.255')
			);
		}

		// send 1 final claim packet
		const finalClaimPacket = new DeviceNumberClaimFinal(
			device.name,
			device.deviceNumber,
			1
		).toBuffer();
		await setTimeout(
			300,
			this.socket.send(finalClaimPacket, DISCOVERY_PORT, '255.255.255.255')
		);

		// it is unclear how the claim will fail, possibly should be verified against
		// the device registry to see if any other players have claimed the same number
		// at any point during the process and then give up and return false?
		return true;
	}
}
