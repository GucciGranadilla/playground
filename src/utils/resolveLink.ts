export type SanityLink = {
	enabled?: boolean
	type?: 'page' | 'link' | 'anchor' | 'popup'
	page?: {
		_id?: string
		_type?: string
		title?: string
		slug?: { current?: string }
	}
	sectionId?: string
	link?: string
	anchor?: string
	popupType?: string
	label?: string
}

export type ResolvedLink = {
	href?: string
	external?: boolean
	popupType?: string
	label?: string
}

// Map page document types to their URL bases. Extend as page types are added.
const pageRoutes: Record<string, string> = {
	homePage: '/',
}

export function resolveLink(link?: SanityLink | null): ResolvedLink | null {
	if (!link?.enabled || !link.type) return null
	const label = link.label

	switch (link.type) {
		case 'page': {
			const route =
				(link.page?._type && pageRoutes[link.page._type]) ||
				(link.page?.slug?.current ? `/${link.page.slug.current}` : '/')
			const href = link.sectionId ? `${route}#${link.sectionId}` : route
			return { href, label }
		}
		case 'link':
			return { href: link.link, external: true, label }
		case 'anchor':
			return { href: link.anchor ? `#${link.anchor}` : undefined, label }
		case 'popup':
			return { popupType: link.popupType, label }
		default:
			return null
	}
}
