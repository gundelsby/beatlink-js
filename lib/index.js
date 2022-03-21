import DeviceRegistry from './device-registry/registry.js';
import { createBoundSocket } from './net/util/socketUtils.js';
import NetworkServices, {
	DISCOVERY_PORT,
	BEAT_TRACKING_PORT,
	DEVICE_STATUS_PORT
} from './net/index.js';

const discoverySocket = createBoundSocket(DISCOVERY_PORT);
const beatTrackingSocket = createBoundSocket(BEAT_TRACKING_PORT);
const deviceStatusSocket = createBoundSocket(DEVICE_STATUS_PORT);

/**
 * Initializes services and returns them
 *
 * @returns {Promise<{NetworkServices, DeviceRegistry}>} initaliazed services
 */
export default async function initialize() {
	(await deviceStatusSocket).setBroadcast(true);

	const networkServices = new NetworkServices(
		await discoverySocket,
		await beatTrackingSocket,
		await deviceStatusSocket
	);
	const registry = new DeviceRegistry(networkServices.deviceDiscoveryService);

	return {
		NetworkServices: networkServices,
		registry
	};
}
