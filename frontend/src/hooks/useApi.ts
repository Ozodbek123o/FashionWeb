import { useCallback, useEffect, useState } from 'react'

interface ApiResponse<T> {
	status: string
	data: T
	message?: string
}

export function useApi<T>(url: string) {
	const [data, setData] = useState<T | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)

	const fetchData = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const response = await fetch(url)
			const result: ApiResponse<T> = await response.json()

			if (result.status === 'success') {
				setData(result.data)
			} else {
				setError(result.message || 'An error occurred')
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Network error')
		} finally {
			setLoading(false)
		}
	}, [url])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	return { data, loading, error, refetch: fetchData }
}
