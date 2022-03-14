import { setTimeout } from 'timers';
import Device from './Device.js';
import KeepAlive from '../net/discovery/packets/KeepAlive.js';
import { DISCOVERY_PORT } from '../net/index.js';

/**
 *
 */
export default class VirtualDevice extends Device {
	/**
	 *
	 * @param {import('./deviceTypes.js').deviceTypes} deviceType
	 * @param {string} deviceName
	 * @param {number[]} macAddress
	 * @param {number} keepaliveInterval
	 * @param {import('dgram').Socket} broadcastSocket
	 */
	constructor(
		deviceType,
		deviceName,
		macAddress,
		keepaliveInterval,
		broadcastSocket
	) {
		super(deviceType, deviceName, macAddress);

		this.keepaliveInterval = keepaliveInterval;
		this.broadcastSocket = broadcastSocket;

		this.isPoweredOn = true;
	}

	powerDown() {
		this.isPoweredOn = false;
	}

	powerUp() {
		this.isPoweredOn = true;
	}

	sendKeepAlive(timeUntilNext) {
		if (!this.isPoweredOn) {
			return;
		}

		const keepalivePacket = new KeepAlive(
			this.name,
			this.deviceNumber,
			this.macAddress,
			this.ipAddress,
			this.type
		).toBuffer();
		this.broadcastSocket.send(
			keepalivePacket,
			DISCOVERY_PORT,
			'255.255.255.255'
		);

		setTimeout(() => {
			this.sendKeepAlive(timeUntilNext);
		}, timeUntilNext);
	}
}
