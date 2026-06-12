export function buildApiUrl(
	path: string,
	apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '',
) {
	const normalizedApiBaseUrl = apiBaseUrl.replace(/\/+$/, '')
	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	return normalizedApiBaseUrl
		? `${normalizedApiBaseUrl}${normalizedPath}`
		: normalizedPath
}
