import { packetTypes } from '../../util/packet-types.js';
import BasePacket from './BasePacket.js';
import { Buffer } from 'buffer';
import { convertDecimalPitchPercentageToFourByteValue } from '../../beat-tracking/helpers/valueConverters.js';

export default class MixerPacket extends BasePacket {
	constructor(deviceNumber, deviceName, isTempoMaster, pitch = 0, bpm = 0) {
		super(packetTypes.MIXER_STATUS, 0x00, deviceNumber, deviceName);
		this.isTempoMaster = isTempoMaster;
		this.pitch = pitch;
		this.bpm = bpm;
	}

	toBuffer() {
		// data portion for the packet, starting at pos 0x24 in the
		// assembled packet
		const tempoMasterFlagValue = this.isTempoMaster
			? MixerPacket.tempoMasterStatusCodes.MASTER
			: MixerPacket.tempoMasterStatusCodes.NOT_MASTER;
		const pitchAsBytes = Buffer.from([0, 0, 0, 0]);
		pitchAsBytes.writeInt32BE(
			convertDecimalPitchPercentageToFourByteValue(this.pitch)
		);

		const data = [
			this.deviceNumber,
			0x00, // unused/unknown
			0x00, // unused/unknown
			tempoMasterFlagValue,
			...pitchAsBytes,
			0x80
		];

		const base = super.toBuffer();
		const buffer = Buffer.from([
			...base,
			0x00, // reserve space for 2 byte LENr integer
			0x00, // reserve space for 2 byte LENr integer
			...data
		]);
		buffer.writeInt16BE(data.length, base.length); // write LENr value

		return buffer;
	}

	/**
	 * Creates a MixerPacket object from raw packet data.
	 *
	 * @param {Buffer} buffer - the raw packet data
	 *
	 * @returns {MixerPacket} - the decoded data as a MixerPacket object
	 */
	static fromBuffer(buffer) {
		const base = BasePacket.fromBuffer(buffer);

		return new MixerPacket(base.deviceNumber, base.deviceName);
	}

	static tempoMasterStatusCodes = {
		MASTER: 0xf0,
		NOT_MASTER: 0xd0
	};
}
