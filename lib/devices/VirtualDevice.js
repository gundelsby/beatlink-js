import { setTimeout } from 'timers';
import Device from './Device.js';
import KeepAlive from '../net/discovery/packets/KeepAlive.js';
import NetworkServices, { DISCOVERY_PORT } from '../net/index.js';
import { isIpAddress } from '../net/util/validators.js';
import { DEVICE_TIMEOUT_MS } from '../device-registry/registry.js';
import { getLogger } from '../util/logger.js';

const log = getLogger('lib/devices/VirtualDevice');

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

	/**
	 * Creates a virtual device using the provided device details and addresses
	 * and negotiates a device number for it on the network. This number will
	 * be either 1,2,3 or 4. If neither of those device numbers can be
	 * reserved this function will throw an error.
	 *
	 * This function can be supplied with a blacklist of numbers to not try.
	 *
	 * @param {Device} device - base device data
	 * @param {number[]} ipAddress - the ip address to use. Messages from other devices will be sent to this address. Therefore this address needs to be the same address you will listen for messages from other devices on
	 * @param {import('../net/discovery/DeviceDiscoveryService.js').default} deviceDiscoveryService - the device discovery service to use for claiming a device number
	 * @param {number[]} [deviceNumberBlacklist] - device numbers provided here will not be attempted reserved
	 * @returns a negotiated virtual device
	 * @throws {Error} on invalid input data (check error message) or if unable to claim a device number for the virtual device on the network
	 */
	static async getNegotiatedVirtualDevice(
		device,
		ipAddress,
		deviceDiscoveryService,
		deviceNumberBlacklist = []
	) {
		if (!isIpAddress(ipAddress)) {
			throw new Error(`${ipAddress} is not a valid IP address`);
		}

		log('Negotiating device number for virtual device', { device, ipAddress });

		const availableNumbers = [1, 2, 3, 4].filter(
			(n) => !deviceNumberBlacklist.includes(n)
		);

		let claimedDeviceNumber;
		for (const candidate of availableNumbers) {
			if (
				await deviceDiscoveryService.claimDeviceNumber(
					device,
					candidate,
					ipAddress
				)
			) {
				claimedDeviceNumber = candidate;
				break;
			}
		}

		const virtualDevice = new VirtualDevice(
			device.type,
			device.name,
			device.macAddress,
			DEVICE_TIMEOUT_MS - 500,
			NetworkServices.deviceDiscoveryService
		);
		virtualDevice.setDeviceNumber(claimedDeviceNumber);
		virtualDevice.setIpAddress(ipAddress);

		log('Created virtual device', virtualDevice);

		return virtualDevice;
	}
}
