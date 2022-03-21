import BeatTrackingService from './beat-tracking/BeatTrackingService.js';
import DeviceDiscoveryService from './discovery/DeviceDiscoveryService.js';
import StatusTrackingService from './status-tracking/index.js';

const DISCOVERY_PORT = 50000;
const BEAT_TRACKING_PORT = 50001;
const DEVICE_STATUS_PORT = 50002;

export { DISCOVERY_PORT, BEAT_TRACKING_PORT, DEVICE_STATUS_PORT };

export default class NetworkServices {
	/**
	 *
	 * @param {import('dgram').Socket} discoverySocket
	 * @param {import('dgram').Socket} beatTrackingSocket
	 * @param {import('dgram').Socket} deviceStatusSocket
	 */
	constructor(discoverySocket, beatTrackingSocket, deviceStatusSocket) {
		this.discoverySocket = discoverySocket;
		this.beatTrackingSocket = beatTrackingSocket;
		this.deviceStatusSocket = deviceStatusSocket;

		this.deviceDiscoveryService = new DeviceDiscoveryService(
			this.discoverySocket
		);
		this.beatTrackingService = new BeatTrackingService(this.beatTrackingSocket);
		this.deviceStatusTrackingService = new StatusTrackingService(
			this.deviceStatusSocket
		);
	}

	shutdown() {
		// kill services
		this.deviceDiscoveryService.shutdown();
		this.beatTrackingService.shutdown();
		this.deviceStatusTrackingService.shutdown();

		// close sockets
		this.discoverySocket.close();
		this.beatTrackingSocket.close();
		this.deviceStatusSocket.close();
	}
}
