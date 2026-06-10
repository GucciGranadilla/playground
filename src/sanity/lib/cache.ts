let store: any

// Only initialize LMDB on the server side
if (typeof window === 'undefined') {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { open } = require('lmdb')
	store = open({
		path: './.cache/lmdb',
		encoding: 'json',
		compression: true,
	})
}

const TTL_5_MINUTES = 5 * 60 * 1000 // 5 minutes in milliseconds
const TTL_1_MINUTE = 60 * 1000 // 60 seconds in milliseconds (ISR default)
const isDev = process.env.NODE_ENV === 'development'

export async function getFromCache<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttl: number = TTL_5_MINUTES
): Promise<T> {
	// If running in development mode, don't use cache
	if (isDev) {
		return await fetcher()
	}

	const cached = await store.get(key)

	if (cached) {
		const { data, timestamp } = cached
		if (Date.now() - timestamp < ttl) {
			return data
		}
	}

	const freshData = await fetcher()
	await store.put(key, {
		data: freshData,
		timestamp: Date.now(),
	})

	return freshData
}

export { TTL_5_MINUTES, TTL_1_MINUTE }

// Clear a specific cache key
export async function clearCache(key: string) {
	if (typeof window === 'undefined' && !isDev) {
		if (key) {
			await store.remove(key)
			return true
		}
	}
	return false
}

// Clear all cache entries matching a prefix
export async function clearCacheByPrefix(prefix: string) {
	if (typeof window === 'undefined' && !isDev) {
		const keys = await store.getKeys().all()
		const matchingKeys = keys.filter((k: string) => k.startsWith(prefix))

		for (const key of matchingKeys) {
			await store.remove(key)
		}

		return matchingKeys.length
	}
	return 0
}
