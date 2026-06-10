import { getFromCache, TTL_1_MINUTE } from '../../../lib/cache'

import { getHomePageData } from './home'

// Generic page data fetcher. Uses 60s TTL by default to align with ISR revalidate.
// Add cases as you add page types (aboutPage, contactPage, etc.).
export const getPageData = async (
	pageType: string,
	slug?: string,
	ttl: number = TTL_1_MINUTE
) => {
	const cacheKey = `pageData_${pageType}${slug ? `_${slug}` : ''}`

	return await getFromCache(
		cacheKey,
		async () => {
			switch (pageType) {
				case 'homePage':
					return getHomePageData()
				default:
					throw new Error(`Unknown page type: ${pageType}`)
			}
		},
		ttl
	)
}

export { getHomePageData }
