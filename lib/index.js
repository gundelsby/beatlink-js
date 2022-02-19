import DeviceRegistry from './device-registry/registry.js';
import DeviceDiscoveryService from './net/discovery/DeviceDiscoveryService.js';

const discoveryService = new DeviceDiscoveryService();
const registry = new DeviceRegistry(discoveryService);

export { registry };
