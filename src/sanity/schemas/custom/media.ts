type MediaOpts = {
	name: string
	title: string
	description?: string
	required?: boolean
	/** 'image' = images only (default), 'file' kept for back-compat with older callers. */
	type?: 'image' | 'file'
	/** Include desktopImage/mobileImage variant fields. */
	responsive?: boolean
	/** Include an `alt` text field on the media object. */
	altText?: boolean
	minWidth?: number
	minHeight?: number
	fileType?: string
	maxFileSize?: number
	group?: string
}

const imageField = (
	name: string,
	title: string,
	{
		required,
		minWidth,
		minHeight,
		maxFileSize,
	}: Pick<MediaOpts, 'required' | 'minWidth' | 'minHeight' | 'maxFileSize'>
) => ({
	name,
	title,
	type: 'image',
	options: { hotspot: true },
	validation: (rule: any) => {
		let chain = rule
		if (required) chain = chain.required()
		chain = chain.custom(async (value: any) => {
			if (!value?.asset?._ref) return true
			if (maxFileSize && value.asset?.size && value.asset.size > maxFileSize * 1024 * 1024) {
				return `File must be smaller than ${maxFileSize}MB`
			}
			if ((minWidth || minHeight) && value.asset?.metadata?.dimensions) {
				const { width, height } = value.asset.metadata.dimensions
				if (minWidth && width < minWidth) return `Image must be at least ${minWidth}px wide`
				if (minHeight && height < minHeight) return `Image must be at least ${minHeight}px tall`
			}
			return true
		})
		return chain
	},
})

const media = ({
	name,
	title,
	description,
	required,
	responsive = false,
	altText = true,
	minWidth,
	minHeight,
	maxFileSize,
	group,
}: MediaOpts) => ({
	name,
	title,
	description,
	group,
	type: 'object',
	fields: [
		...(altText
			? [
					{
						name: 'alt',
						title: 'Alt text',
						type: 'string',
						description:
							'Describe the image for screen readers and search engines.',
					},
				]
			: []),
		imageField('image', responsive ? 'Default image' : 'Image', {
			required,
			minWidth,
			minHeight,
			maxFileSize,
		}),
		...(responsive
			? [
					imageField('desktopImage', 'Desktop image', {
						minWidth,
						minHeight,
						maxFileSize,
					}),
					imageField('mobileImage', 'Mobile image', {
						minHeight,
						maxFileSize,
					}),
				]
			: []),
		// Video fields (video reference + full / desktopPreview / mobilePreview inline)
		// will be added here once the `video` schema lands. The mediaQuery already
		// projects them — they'll just return null until the schema catches up.
	],
})

export default media
