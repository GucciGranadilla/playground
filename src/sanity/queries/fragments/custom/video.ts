// Stub fragments — fill in the actual fields when the video schema lands.
// `videoFieldsQuery` projects fields off a video DOCUMENT (used with `video->`).
// `videoQuery` projects an inline video OBJECT field on a parent (e.g. media.full).

export const videoFieldsQuery = () => `
	_id,
	_type
`.trim()

export const videoQuery = (fieldName: string) => `
${fieldName} {
	_type
}`.trim()
