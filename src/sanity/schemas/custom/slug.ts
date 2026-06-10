export async function isUniqueOtherThanLanguage(slug: string, context: any) {
	const { document, getClient } = context

	if (!document?.language) {
		return true
	}

	const client = getClient({ apiVersion: '2023-04-24' })
	const id = document._id.replace(/^drafts\./, '')

	const params = {
		draft: `drafts.${id}`,
		published: id,
		language: document.language,
		slug,
	}

	const query = `!defined(*[
    !(_id in [$draft, $published]) &&
    slug.current == $slug &&
    language == $language
  ][0]._id)`

	return client.fetch(query, params)
}

type SlugOpts = { name: string; source?: string; group?: string }

const slug = ({ name, source, group }: SlugOpts) => [
	{
		name,
		title: 'Slug',
		type: 'slug',
		group,
		options: {
			source: source || 'title',
			maxLength: 200,
			isUnique: isUniqueOtherThanLanguage,
		},
		validation: (rule: any) =>
			rule.required().custom(({ current }: { current?: string }) => {
				if (!current) return 'Slug is required'
				if (typeof current === 'string' && /\s/.test(current)) {
					return 'Slug cannot contain spaces'
				}
				return true
			}),
	},
]

export default slug
