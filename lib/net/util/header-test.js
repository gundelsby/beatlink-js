import { assert } from 'chai';
import { createProLinkHeader } from './header.js';

describe('net/util', function () {
	describe('createProLinkHeader', function () {
		it('should be a Buffer', function () {
			const actual = createProLinkHeader(0);

			assert.instanceOf(actual, Buffer);
		});

		it('should be 11 bytes long', function () {
			const actual = createProLinkHeader(0);

			assert.equal(actual.byteLength, 11);
		});

		it('should start with the fixed ProLink header byte sequence', function () {
			const byteSequence = [
				0x51, 0x73, 0x70, 0x74, 0x31, 0x57, 0x6d, 0x4a, 0x4f, 0x4c
			];
			const expected = Buffer.from(byteSequence);

			const actual = createProLinkHeader(0).slice(0, expected.length);

			assert.deepEqual(actual, expected);
		});

		it('should end with the given packet type', function () {
			const expected = 0x03;

			const actual = createProLinkHeader(expected);

			assert.equal(actual[actual.length - 1], expected);
		});
	});
});
