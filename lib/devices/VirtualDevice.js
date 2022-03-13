import { setTimeout } from 'timers';
import Device from './Device.js';

export default class VirtualDevice extends Device {
	constructor(deviceType, deviceName, macAddress, keepaliveInterval) {
		super(deviceType, deviceName, macAddress);

		this.keepaliveInterval = keepaliveInterval;

		this.isPoweredOn = true;
	}

	powerDown() {
		this.isPoweredOn = false;
	}

	powerUp() {
		this.isPoweredOn = true;
	}

	sendKeepAlive(timeUntilNext) {
		// don't send keepalive if the "device" is powered off
		if (!this.isPoweredOn) {
			return;
		}

		/**
     * To do this, bind a UDP server socket to port 50002 on the network 
     * interface on which you are receiving DJ-Link traffic, and start 
     * sending keep-alive packets to port 50000 on the broadcast address 
     * as if you were a CDJ. Copy the structure of a CDJ keep-alive packet,
     * but use the actual MAC and IP addresses of the network interface on 
     * which you are receiving DJ-Link traffic, so the devices can see how 
     * to reach you.
     
     * You can use a value like 05 for D (the device/player number) so as 
     * not to conflict with any actual players you have on the network,
     * and any name you would like. As long as you are sending these packets
     * roughly every 1.5 seconds, the other players and mixers will begin
     * sending packets directly to the socket you have opened on port 50002.
     */

		setTimeout(() => {
			this.sendKeepAlive(timeUntilNext);
		}, timeUntilNext);
	}
}
