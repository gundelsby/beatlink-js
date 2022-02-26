import { calcRealBpm } from './lib/helpers/tempoCalculations.js';
import { registry } from './lib/index.js';
import BeatTrackingService from './lib/net/beat-tracking/BeatTrackingService.js';
import { getLogger } from './lib/util/logger.js';

const log = getLogger('main');

const beatTracker = new BeatTrackingService();
beatTracker.on('beat', ({ packet }) => {
	log('Beat:', packet);
	log('Real BPM', { bpm: calcRealBpm(packet.bpm, packet.pitch) });
});

registry.on('connected', ({ device }) => {
	log('Device connected', { ...device });
});

registry.on('disconnected', ({ device }) => {
	log('Device disconnected', { name: device.name, address: device.macAddress });
});

log('Registered listeners on registry', registry);
