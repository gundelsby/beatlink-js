import { EventEmitter } from 'events';
import Device from '../../devices/Device.js';
import { deviceTypes } from '../../devices/deviceTypes.js';
import VirtualDevice from '../../devices/VirtualDevice.js';

export default class StatusTrackingService extends EventEmitter {
	/**
	 *
	 * @param {import('dgram').Socket} deviceStatusSocket
	 */
	constructor(deviceStatusSocket) {
		super();

		this.socket = deviceStatusSocket;
		this.registerEventListeners();
	}

	registerEventListeners() {
		// add listeners here
	}

	async activate() {
		this.virtualDevice = await VirtualDevice.getNegotiatedVirtualDevice(
			new Device(deviceTypes.CDJ_XDJ, 'BeatlinkJS virtual device', [0, 0, 0]),
			[0, 0, 0, 0],
			[]
		);
	}

	shutdown() {
		this.virtualDevice.powerDown();
		// deregister event listeners
	}
}
