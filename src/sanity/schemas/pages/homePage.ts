import seo from '../custom/seo'
import sections from '../sections'
import string from '../custom/string'

const homePage = {
	name: 'homePage',
	type: 'document',
	title: 'Home',
	groups: [
		{ name: 'hero', title: 'Hero' },
		{ name: 'sections', title: 'Sections' },
		{ name: 'seo', title: 'SEO' },
	],
	fields: [
		{
			name: 'hero',
			title: 'Hero',
			type: 'object',
			group: 'hero',
			fields: [
				string({
					name: 'tag',
					title: 'Tag',
					description: 'Small label above the title (e.g. "Digital studio")',
					required: true,
				}),
				string({
					name: 'title',
					title: 'Title',
					description: 'Main heading, animated with SplitText',
					required: true,
				}),
				string({
					name: 'version',
					title: 'Version label',
					description: 'Release tag shown bottom-left (e.g. "v0.0.1 alpha")',
				}),
				string({
					name: 'scrollLabel',
					title: 'Scroll label',
					description: 'Scroll-to-next-section prompt (e.g. "Scroll Down")',
				}),
			],
		},
		...sections('sections', 'Sections'),
		...seo(),
	],
	preview: {
		prepare() {
			return { title: 'Home' }
		},
	},
}

export default homePage
