import { assert } from 'chai';
import sinon from 'sinon';

import EventEmitter from 'events';
import DeviceRegistry from './registry.js';
import Device from '../devices/Device.js';

describe('lib/device-registry', function () {
	describe('device discovery', function () {
		describe('keepalive event', function () {
			const eventPacket = {
				deviceName: 'XDJ-700',
				deviceNumber: 2,
				macAddress: [200, 61, 252, 10, 124, 47],
				ipAddress: [192, 168, 100, 7],
				deviceType: 2
			};
			let registry, mockService;

			beforeEach(function () {
				sinon.useFakeTimers();
				mockService = new EventEmitter();
				registry = new DeviceRegistry(mockService);
			});

			afterEach(function () {
				registry.shutdown();
				sinon.clock.restore();
				sinon.restore();
			});

			it('should create a new device', function () {
				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});

				assert.equal(registry.devices.size, 1);
			});

			it('should store the device using the mac address as key', function () {
				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});

				assert(registry.devices.has(eventPacket.macAddress.toString()));
			});

			it('should store the device as an instance of Device', function () {
				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});
				const actual = registry.devices.get(
					eventPacket.macAddress.toString()
				);

				assert.instanceOf(actual, Device);
			});

			it('should set type from packet data', function () {
				const expected = eventPacket.deviceType;

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});
				const { type: actual } = registry.devices.get(
					eventPacket.macAddress.toString()
				);

				assert.equal(actual, expected);
			});

			it('should set the name from packet data', function () {
				const expected = eventPacket.deviceName;

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});
				const { name: actual } = registry.devices.get(
					eventPacket.macAddress.toString()
				);

				assert.equal(actual, expected);
			});

			it('should set the mac address from packet data', function () {
				const expected = eventPacket.macAddress.slice();

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});
				const { macAddress: actual } = registry.devices.get(
					eventPacket.macAddress.toString()
				);

				assert.deepEqual(actual, expected);
			});

			it('should set the ip address from packet data', function () {
				const expected = eventPacket.ipAddress.slice();

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});
				const { ipAddress: actual } = registry.devices.get(
					eventPacket.macAddress.toString()
				);

				assert.deepEqual(actual, expected);
			});

			it('should set device number from packet data', function () {
				const expected = eventPacket.deviceNumber;

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});
				const { deviceNumber: actual } = registry.devices.get(
					eventPacket.macAddress.toString()
				);

				assert.equal(actual, expected);
			});

			it('should emit a connected event', function () {
				const callback = sinon.spy();
				registry.on('connected', callback);

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});

				assert.equal(
					callback.callCount,
					1,
					'Unexpected event callback count'
				);
			});

			it('should pass device data to event listeners', function () {
				const callback = sinon.spy();
				registry.on('connected', callback);

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});
				const expected = registry.devices.get(
					eventPacket.macAddress.toString()
				);

				const { device: actual } = callback.args[0][0];

				assert.deepEqual(actual, expected);
			});

			it('should set lastSeen to current time', function () {
				const expected = Date.now();

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});
				const { lastSeen: actual } = registry.devices.get(
					eventPacket.macAddress.toString()
				);

				assert.equal(actual, expected);
			});

			it('should not create additional devices on consecutive events for the same device', function () {
				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});
				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});

				const actual = registry.devices.size;

				assert.equal(actual, 1);
			});

			it('should update lastSeen when receiving a new event for an existing device', function () {
				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});

				const expected = sinon.clock.tick(500);

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});

				const { lastSeen: actual } = registry.devices.get(
					eventPacket.macAddress.toString()
				);

				assert.equal(actual, expected);
			});
		});

		describe('device disconnect', function () {
			const eventPacket = {
				deviceName: 'XDJ-700',
				deviceNumber: 2,
				macAddress: [200, 61, 252, 10, 124, 47],
				ipAddress: [192, 168, 100, 7],
				deviceType: 2
			};
			let registry, mockService;

			beforeEach(function () {
				sinon.useFakeTimers();
				mockService = new EventEmitter();
				registry = new DeviceRegistry(mockService);
			});

			afterEach(function () {
				registry.shutdown();
				sinon.clock.restore();
				sinon.restore();
			});

			it('should remove a device if keepalive has not been received for 3 seconds', function () {
				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});

				sinon.clock.tick(6000);

				const actual = registry.devices.size;

				assert.equal(actual, 0);
			});

			it('should emit a disconnected event when a device is removed', function () {
				const callback = sinon.spy();
				registry.on('disconnected', callback);

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});

				sinon.clock.tick(6000);

				assert.equal(
					callback.callCount,
					1,
					'Unexpected event callback count'
				);
			});

			it('should pass device data to event listeners', function () {
				const callback = sinon.spy();
				registry.on('disconnected', callback);

				mockService.emit('keepalive', {
					packet: Object.assign({}, eventPacket)
				});
				const expected = registry.devices.get(
					eventPacket.macAddress.toString()
				);

				sinon.clock.tick(6000);
				const { device: actual } = callback.args[0][0];

				assert.deepEqual(actual, expected);
			});
		});
	});
});
