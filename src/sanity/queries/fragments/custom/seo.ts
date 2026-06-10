import { mediaQuery } from './media'

export const seoQuery = (fieldName = 'seo') => {
	const seoFields = `
	title,
	description,
	${mediaQuery('media')}
`.trim()

	// If fieldName is null or empty string, return fields without wrapper
	if (!fieldName) {
		return seoFields
	}

	return `
${fieldName} {
	${seoFields}
}`.trim()
}
