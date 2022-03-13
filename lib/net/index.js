import { createSocket } from 'dgram';
import BeatTrackingService from './beat-tracking/BeatTrackingService.js';
import DeviceDiscoveryService from './discovery/DeviceDiscoveryService.js';

const DISCOVERY_PORT = 50000;
const BEAT_TRACKING_PORT = 50001;
const DEVICE_STATUS_PORT = 50002;

class NetworkServices {
	constructor() {
		this.discoverySocket = createSocket('udp4');
		this.discoverySocket.bind(DISCOVERY_PORT);
		this.deviceDiscoveryService = new DeviceDiscoveryService(
			this.discoverySocket
		);

		this.beatTrackingSocket = createSocket('udp4');
		this.beatTrackingSocket.bind(BEAT_TRACKING_PORT);
		this.beatTrackingService = new BeatTrackingService(this.beatTrackingSocket);

		this.deviceStatusSocket = createSocket('udp4');
		this.deviceStatusSocket.bind(DEVICE_STATUS_PORT);
	}

	shutdown() {
		// kill services
		this.deviceDiscoveryService.shutdown();
		this.beatTrackingService.shutdown();

		// close sockets
		this.discoverySocket.close();
		this.beatTrackingSocket.close();
		this.deviceStatusSocket.close();
	}
}

export default new NetworkServices();
