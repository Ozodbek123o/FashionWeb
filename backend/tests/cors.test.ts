import { describe, expect, it } from 'vitest'
import { isOriginAllowed, parseAllowedOrigins } from '../src/lib/cors'

describe('parseAllowedOrigins', () => {
	it('returns trimmed origins and removes empty values', () => {
		expect(
			parseAllowedOrigins(
				' http://localhost:3008, https://fashion.example.com,  ',
			),
		).toEqual(['http://localhost:3008', 'https://fashion.example.com'])
	})

	it('returns an empty list for undefined input', () => {
		expect(parseAllowedOrigins()).toEqual([])
	})
})

describe('isOriginAllowed', () => {
	it('allows requests without an origin', () => {
		expect(isOriginAllowed(undefined, ['https://fashion.example.com'])).toBe(
			true,
		)
	})

	it('allows all origins when no allow-list is configured', () => {
		expect(isOriginAllowed('https://random-site.com', [])).toBe(true)
	})

	it('allows configured origins only', () => {
		expect(
			isOriginAllowed('https://fashion.example.com', [
				'https://fashion.example.com',
			]),
		).toBe(true)
		expect(
			isOriginAllowed('https://evil.example.com', [
				'https://fashion.example.com',
			]),
		).toBe(false)
	})
})
