import { networkInterfaces } from 'os';
import { calcRealBpm } from './lib/helpers/tempoCalculations.js';
import initialize from './lib/index.js';
import { getLogger } from './lib/util/logger.js';

const log = getLogger('main');

initialize(getLocalIpv4Props()).then(({ NetworkServices, registry }) => {
	const beatTracker = NetworkServices.beatTrackingService;

	beatTracker.on('beat', ({ packet }) => {
		log('Beat:', packet);
		log('Real BPM', { bpm: calcRealBpm(packet.bpm, packet.pitch) });
	});

	registry.on('connected', ({ device }) => {
		log('Device connected', { ...device });
	});

	registry.on('disconnected', ({ device }) => {
		log('Device disconnected', {
			name: device.name,
			address: device.macAddress
		});
	});

	log('Registered listeners on registry', registry);
});

function getLocalIpv4Props() {
	const interfaces = networkInterfaces();
	for (const iface of Object.keys(interfaces)) {
		const ipv4Props = interfaces[iface]?.find(
			({ family }) => family === 'IPv4'
		);
		if (ipv4Props?.internal === false) {
			return ipv4Props;
		}
	}

	return null;
}
