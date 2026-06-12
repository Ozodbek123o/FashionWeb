export function parseAllowedOrigins(input?: string) {
	return (input || '')
		.split(',')
		.map(origin => origin.trim())
		.filter(Boolean)
}

export function isOriginAllowed(
	origin: string | undefined,
	allowedOrigins: string[],
) {
	if (!origin || allowedOrigins.length === 0) {
		return true
	}

	return allowedOrigins.includes(origin)
}
