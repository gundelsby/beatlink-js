import { isMacAddress, isIpAddress } from '../net/util/validators.js';

export default class Device {
	constructor(type, name, macAddress) {
		if (!isMacAddress(macAddress)) {
			throw new Error(`Invalid mac address ${macAddress}`);
		}

		this.type = type;
		this.name = name;
		this.macAddress = macAddress;
		this.ipAddress = null;
		this.deviceNumber = null;
	}

	setIpAddress(ipAddress) {
		if (!isIpAddress(ipAddress)) {
			throw new Error(`Invalid IP address ${ipAddress}`);
		}

		this.ipAddress = ipAddress;
	}

	setDeviceNumber(deviceNumber) {
		this.deviceNumber = deviceNumber;
	}
}
