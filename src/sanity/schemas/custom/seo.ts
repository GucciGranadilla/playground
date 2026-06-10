import media from './media'
import string from './string'

const seo = () => [
	{
		title: 'SEO',
		name: 'seo',
		type: 'object',
		group: 'seo',
		description: 'Search engine optimization settings',
		fields: [
			string({
				title: 'Title',
				name: 'title',
				description:
					'Keyword focused title for the page. Visible on search engine results, browser tabs and social shares. Character count: ~50-60',
				required: true,
			}),
			string({
				title: 'Description',
				name: 'description',
				description:
					'A short relevant summary of the page. Visible on search engines results. Character count: ~150-160',
				required: true,
			}),
			media({
				name: 'media',
				title: 'Media',
				description:
					'An image that represents the page. Visible on social shares. Image size: 1200x630px',
				required: true,
				type: 'image',
				responsive: false,
				altText: false,
				minWidth: 1200,
				minHeight: 630,
				fileType: 'jpg',
				maxFileSize: 1.5,
			}),
		],
	},
]

export default seo
