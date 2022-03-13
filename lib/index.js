import networkServices from './net/index.js';
import DeviceRegistry from './device-registry/registry.js';

const registry = new DeviceRegistry(networkServices.deviceDiscoveryService);

export { registry, networkServices };
