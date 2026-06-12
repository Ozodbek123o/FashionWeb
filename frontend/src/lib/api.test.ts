import { describe, expect, it } from 'vitest'
import { buildApiUrl } from './api'

describe('buildApiUrl', () => {
	it('returns a relative path when no base url is provided', () => {
		expect(buildApiUrl('/api/health', '')).toBe('/api/health')
	})

	it('prepends the configured api base url', () => {
		expect(buildApiUrl('/api/orders', 'https://api.fashion.example.com')).toBe(
			'https://api.fashion.example.com/api/orders',
		)
	})

	it('normalizes duplicate slashes between base url and path', () => {
		expect(buildApiUrl('api/products', 'https://api.fashion.example.com/')).toBe(
			'https://api.fashion.example.com/api/products',
		)
	})
})
