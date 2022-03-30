import DeviceRegistry from './device-registry/registry.js';
import { createBoundSocket, findMacAddress } from './net/util/socketUtils.js';
import NetworkServices, {
	DISCOVERY_PORT,
	BEAT_TRACKING_PORT,
	DEVICE_STATUS_PORT
} from './net/index.js';
import { deviceTypes } from './devices/deviceTypes.js';
import Device from './devices/Device.js';
import VirtualDevice from './devices/VirtualDevice.js';
import { isIpAddress } from './net/util/validators.js';

/**
 * Initializes services and returns them
 *
 * @param {string} address - IP address to bind sockets to
 *
 * @returns {Promise<{NetworkServices, DeviceRegistry, VirtualDevice}>} initaliazed services
 */
export default async function initialize(address) {
	if (!isIpAddress(address?.split('.').map(Number))) {
		throw Error(`Unable to bind sockets to invalid IP address ${address}`);
	}

	const discoverySocket = await createBoundSocket(DISCOVERY_PORT, address);
	const beatTrackingSocket = await createBoundSocket(
		BEAT_TRACKING_PORT,
		address
	);
	const deviceStatusSocket = await createBoundSocket(
		DEVICE_STATUS_PORT,
		address
	);

	deviceStatusSocket.setBroadcast(true);
	const networkServices = new NetworkServices(
		discoverySocket,
		beatTrackingSocket,
		deviceStatusSocket
	);
	const registry = new DeviceRegistry(networkServices.deviceDiscoveryService);

	const statusSocketInterfaceMacAddress = findMacAddress(deviceStatusSocket);
	const virtualDevice = await VirtualDevice.getNegotiatedVirtualDevice(
		new Device(
			deviceTypes.CDJ_XDJ,
			'BeatlinkJS virtual device',
			statusSocketInterfaceMacAddress
		),
		deviceStatusSocket.address().address.split('.').map(Number),
		networkServices.deviceDiscoveryService
	);

	return {
		NetworkServices: networkServices,
		registry,
		virtualDevice
	};
}
