import pages from '../pages'

type LinkType = 'page' | 'link' | 'anchor' | 'popup'
type PopupType = 'video' | 'whatWeDo' | 'getInvolved' | 'newsletter'

type LinkOpts = {
	name?: string
	title?: string
	required?: boolean | ((context: any) => boolean)
	allowedTypes?: LinkType[]
	allowedPopupTypes?: PopupType[]
	hidden?: any
}

const link = ({
	name = 'link',
	title = 'Link',
	required = false,
	allowedTypes = ['page', 'link', 'anchor', 'popup'],
	allowedPopupTypes = ['getInvolved'],
	hidden,
}: LinkOpts = {}) => {
	return {
		name,
		title,
		type: 'object',
		description: 'Configurable link with multiple destination types',
		hidden,
		fields: [
			{
				title: 'Enable Link',
				name: 'enabled',
				type: 'boolean',
				description: 'Toggle to enable or disable this link',
				initialValue: false,
			},
			{
				title: 'Type',
				name: 'type',
				type: 'string',
				description: 'Select the type of link destination',
				hidden: ({ parent }: any) => parent?.enabled === false,
				options: {
					list: allowedTypes
						.map((type) => {
							const typeMap: Record<LinkType, { title: string; value: string }> = {
								page: { title: 'Page', value: 'page' },
								link: { title: 'Link', value: 'link' },
								anchor: { title: 'Anchor', value: 'anchor' },
								popup: { title: 'Popup', value: 'popup' },
							}
							return typeMap[type]
						})
						.filter(Boolean),
				},
				validation: (rule: any) =>
					rule.custom((field: any, context: any) => {
						const { parent } = context
						if (parent?.enabled !== false && !field) {
							return 'Please select a link type'
						}
						return true
					}),
			},
			// Page reference field
			...(allowedTypes.includes('page')
				? [
						{
							title: 'Page',
							name: 'page',
							type: 'reference',
							description: 'Select a page from the content library',
							to: pages.map((page) => ({ type: page.name })),
							hidden: ({ parent }: any) =>
								parent?.enabled === false || parent?.type !== 'page',
							validation: (rule: any) =>
								rule.custom((field: any, context: any) => {
									const { parent } = context
									if (parent?.type === 'page' && !field) {
										return 'Page is required when link type is Page'
									}
									return true
								}),
						},
						{
							title: 'Add Section ID',
							name: 'addSectionId',
							type: 'boolean',
							description:
								'Enable to add a section ID for scrolling to a specific section on the page',
							initialValue: false,
							hidden: ({ parent }: any) =>
								parent?.enabled === false || parent?.type !== 'page',
						},
						{
							title: 'Section ID',
							name: 'sectionId',
							type: 'string',
							description:
								'Add a section ID to scroll to (e.g., "careers" for #careers)',
							placeholder: 'careers',
							hidden: ({ parent }: any) =>
								parent?.enabled === false ||
								parent?.type !== 'page' ||
								!parent?.addSectionId,
						},
					]
				: []),
			// Link URL field
			...(allowedTypes.includes('link')
				? [
						{
							title: 'Link',
							name: 'link',
							type: 'url',
							description:
								'Input a full URL e.g. https://google.com. Available types include: http, https, mailto & tel',
							hidden: ({ parent }: any) =>
								parent?.enabled === false || parent?.type !== 'link',
							validation: (rule: any) =>
								rule
									.uri({
										scheme: ['http', 'https', 'mailto', 'tel'],
										allowRelative: true,
									})
									.custom((field: any, context: any) => {
										const { parent } = context
										if (parent?.type === 'link' && !field) {
											return 'URL required'
										}
										return true
									}),
						},
					]
				: []),
			// Anchor field
			...(allowedTypes.includes('anchor')
				? [
						{
							title: 'Anchor',
							name: 'anchor',
							type: 'string',
							description:
								'Section ID to scroll to on the current page (without #). Example: "careers" will scroll to #careers',
							placeholder: 'careers',
							hidden: ({ parent }: any) =>
								parent?.enabled === false || parent?.type !== 'anchor',
							validation: (rule: any) =>
								rule.custom((field: any, context: any) => {
									const { parent } = context
									if (parent?.type === 'anchor' && !field) {
										return 'Anchor is required'
									}
									if (field && field.startsWith('#')) {
										return 'Do not include "#" - it will be added automatically'
									}
									return true
								}),
						},
					]
				: []),
			// Popup type field
			...(allowedTypes.includes('popup')
				? [
						{
							title: 'Popup Type',
							name: 'popupType',
							type: 'string',
							options: {
								list: allowedPopupTypes
									.map((type) => {
										const typeMap: Record<
											PopupType,
											{ title: string; value: string }
										> = {
											video: { title: 'Video', value: 'video' },
											whatWeDo: { title: 'What We Do', value: 'whatWeDo' },
											getInvolved: { title: 'Get Involved', value: 'getInvolved' },
											newsletter: { title: 'Newsletter', value: 'newsletter' },
										}
										return typeMap[type]
									})
									.filter(Boolean),
							},
							description: 'Select which popup you would like',
							hidden: ({ parent }: any) =>
								parent?.enabled === false || parent?.type !== 'popup',
							validation: (rule: any) =>
								rule.custom((field: any, context: any) => {
									const { parent } = context
									if (parent?.type === 'popup' && !field) {
										return 'Popup type is required'
									}
									return true
								}),
						},
					]
				: []),
			// Label field
			{
				title: 'Label',
				name: 'label',
				type: 'string',
				description: 'Text used for the link',
				hidden: ({ parent }: any) =>
					parent?.enabled === false || parent?.type === undefined,
				validation: (rule: any) =>
					rule.custom((value: any, context: any) => {
						const { parent } = context
						if (parent?.type && !value) {
							return 'Link label is required'
						}
						return true
					}),
			},
		],
		validation: (rule: any) =>
			rule.custom((value: any, context: any) => {
				const isRequired =
					typeof required === 'function' ? required(context) : required
				if (isRequired && value?.enabled !== false && !value?.type) {
					return 'Link configuration is required'
				}
				return true
			}),
	}
}

export default link
