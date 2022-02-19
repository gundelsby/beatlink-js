import { registry } from './lib/index.js';
import { getLogger } from './lib/util/logger.js';

const log = getLogger('main');

registry.on('connected', ({ device }) => {
	log('Device connected', { ...device });
});

registry.on('disconnected', ({ device }) => {
	log('Device disconnected', { name: device.name, address: device.macAddress });
});

log('Registered listeners on registry', registry);
