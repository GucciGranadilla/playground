import { videoFieldsQuery, videoQuery } from './video'

const mediaFields = `
	alt,
	image{
		asset->{
			_id,
			url,
			_ref,
			metadata {
				dimensions {
					width,
					height
				}
			}
		}
	},
	desktopImage{
		asset->{
			_id,
			url,
			_ref,
			metadata {
				dimensions {
					width,
					height
				}
			}
		}
	},
	mobileImage{
		asset->{
			_id,
			url,
			_ref,
			metadata {
				dimensions {
					width,
					height
				}
			}
		}
	},
	video->{
		${videoFieldsQuery()}
	},
	${videoQuery('full')},
	${videoQuery('desktopPreview')},
	${videoQuery('mobilePreview')}
`.trim()

export const mediaQuery = (fieldName = 'media') => {
	// If fieldName is null or empty string, return fields without wrapper
	if (!fieldName) {
		return mediaFields
	}

	return `
${fieldName} {
	${mediaFields}
}`.trim()
}
