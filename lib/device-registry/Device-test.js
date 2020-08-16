import * as validators from '../net/util/validators.js';
import sinon from 'sinon';
import { assert } from 'chai';
import Device from './Device.js';
import { deviceTypes } from '../net/discovery/packets/deviceTypes.js';

const macInvalidatorStub = sinon.stub().returns(false);
const ipInvalidatorStub = sinon.stub().returns(false);

const validMacAddress = [0x10, 0x20, 0x30, 0x40, 0x50, 0x60];
const validIpAddress = [192, 168, 0, 13];

describe('lib/device-registry/Device', function () {
	afterEach(function () {
		sinon.restore();
	});

	describe('constructor', function () {
		it('should set type from input', function () {
			const expected = deviceTypes.CDJ_XDJ;

			const { type: actual } = new Device(
				expected,
				'ok',
				validMacAddress.slice(),
				validIpAddress.slice()
			);

			assert.equal(actual, expected);
		});

		it('should set name from input', function () {
			const expected = 'some name';

			const { name: actual } = new Device(
				deviceTypes.CDJ_XDJ,
				expected,
				validMacAddress.slice(),
				validIpAddress.slice()
			);

			assert.equal(actual, expected);
		});

		it('should set mac address from input', function () {
			const expected = validMacAddress.slice();

			const { macAddress: actual } = new Device(
				deviceTypes.CDJ_XDJ,
				'lol',
				validMacAddress.slice(),
				validIpAddress.slice()
			);

			assert.deepEqual(actual, expected);
		});

		it('should throw on invalid mac address', function () {
			sinon.replace(validators, 'isMacAddress', macInvalidatorStub);

			assert.throws(() => {
				new Device(
					deviceTypes.CDJ_XDJ,
					'Valid name',
					[-1, 0, 0, 0, 0, 0],
					validIpAddress
				);
			});
		});
	});

	describe('setIpAddress', function () {
		const device = new Device(
			deviceTypes.CDJ_XDJ,
			'lol',
			validMacAddress.slice()
		);
		it('should set ip address from input', function () {
			const expected = validIpAddress.slice();

			device.setIpAddress(validIpAddress);
			const actual = device.ipAddress;

			assert.deepEqual(actual, expected);
		});

		it('should throw on invalid value', function () {
			sinon.replace(validators, 'isIpAddress', ipInvalidatorStub);

			assert.throws(() => {
				device.setIpAddress([-1, 0, 0, 0]);
			});
		});
	});

	describe('setDeviceNumber', function () {
		it('should set device number from input', function () {
			const expected = 2;
			const device = new Device(
				deviceTypes.CDJ_XDJ,
				'hehe',
				validMacAddress,
				validIpAddress
			);

			device.setDeviceNumber(expected);
			const actual = device.deviceNumber;

			assert.equal(actual, expected);
		});
	});
});
