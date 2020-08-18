import Device from './Device.js';
import { getLogger } from '../util/logger.js';
import { EventEmitter } from 'events';

const log = getLogger('Device Registry');

const DEVICE_TIMEOUT_MS = 3000;

/**
 * A device registry that keeps track of connected ProLink devices.
 *
 * The registry starts a watchdog timer to periodically check if a
 * device has sent a keepalive message. Call {@link DeviceRegistry#shutdown}
 * to clear the timer when the registry service is no longer needed.
 *
 * @module DeviceRegistry
 */
export default class DeviceRegistry extends EventEmitter {
	/**
	 * @param {DiscoveryService} discoveryService - the discovery service to listen to
	 *
	 * @listens module:DiscoveryService~keepalive
	 * @emits module:DeviceRegistry~connected
	 * @emits module:DeviceRegistry~disconnected
	 */
	constructor(discoveryService) {
		super();

		this.devices = new Map();

		discoveryService.on('keepalive', ({ packet }) =>
			this.handleKeepAlive({ packet })
		);

		this.watchDog = setInterval(() => {
			this.removeDisconnectedDevices();
		}, DEVICE_TIMEOUT_MS);
		log('Started');
	}

	/**
	 * Stops the watchdog timer that checks if a device has disconnected
	 */
	shutdown() {
		clearInterval(this.watchDog);
		this.devices = null;
		log('Halted');
	}

	/**
	 * Checks every device in registry to see if it has sent a keepalive
	 * packet within the timeout limit.
	 * Devices that have not done this are removed from the registry, and a
	 * disconnected event will be emitted.
	 */
	removeDisconnectedDevices() {
		for (const [key, value] of this.devices) {
			if (Date.now() - value.lastSeen > DEVICE_TIMEOUT_MS) {
				this.devices.delete(key);

				/**
				 * Disconnected event.
				 *
				 * @event DeviceRegistry#disconnected
				 * @type {object}
				 * @property {Device} device - the device that disconnected
				 */
				this.emit('disconnected', { device: Object.assign({}, value) });
				log('Device removed (timeout)', value);
			}
		}
	}

	/**
	 * Event handler for {@link module:DiscoveryService~keepalive} events
	 *
	 * @param {object} args
	 * @param {KeepAlive} packet - a keepalive packet
	 */
	handleKeepAlive({ packet }) {
		const {
			deviceType,
			deviceName,
			deviceNumber,
			macAddress,
			ipAddress
		} = packet;

		if (this.devices.has(macAddress)) {
			// update last seen timestamp
			this.devices.get(macAddress).lastSeen = Date.now();
			return;
		}

		// create new device
		try {
			const device = new Device(deviceType, deviceName, macAddress);
			device.setIpAddress(ipAddress);
			device.setDeviceNumber(deviceNumber);
			device.lastSeen = Date.now();

			this.devices.set(macAddress, device);

			/**
			 * Connected event.
			 *
			 * @event DeviceRegistry#connected
			 * @type {object}
			 * @property {Device} device - the device that connected
			 */

			this.emit('connected', { device: Object.assign({}, device) });
		} catch (err) {
			log(err);
		}
	}
}
