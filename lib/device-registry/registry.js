import Device from './Device.js';
import { getLogger } from '../util/logger.js';

const log = getLogger('Device Registry');

const DEVICE_TIMEOUT_MS = 500;

export default class DeviceRegistry {
	constructor(discoveryService) {
		this.devices = new Map();

		discoveryService.on('keepalive', ({ packet }) =>
			this.handleKeepAlive({ packet })
		);

		this.watchDog = setInterval(() => {
			this.removeDisconnectedDevices();
		}, DEVICE_TIMEOUT_MS);
		log('Started');
	}

	shutdown() {
		clearInterval(this.watchDog);
		this.devices = null;
		log('Halted');
	}

	removeDisconnectedDevices() {
		for (const [key, value] of this.devices) {
			if (Date.now() - value.lastSeen > DEVICE_TIMEOUT_MS) {
				this.devices.delete(key);
				log('removed', value);
			}
		}
	}

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
		} catch (err) {
			log(err);
		}
	}
}
