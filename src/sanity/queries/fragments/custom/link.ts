export const linkFieldsQuery = () =>
	`
	enabled,
	type,
	page->{
		_id,
		_type,
		title,
		slug { current }
	},
	sectionId,
	link,
	anchor,
	popupType,
	label
`.trim()

export const linkQuery = (fieldName = 'link') =>
	`
${fieldName} {
	${linkFieldsQuery()}
}`.trim()
