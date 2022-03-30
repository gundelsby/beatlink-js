import { calcRealBpm } from './lib/helpers/tempoCalculations.js';
import initialize from './lib/index.js';
import { getLogger } from './lib/util/logger.js';

const log = getLogger('main');

const localIpAddress = '192.168.100.6';

initialize(localIpAddress).then(({ NetworkServices, registry }) => {
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
