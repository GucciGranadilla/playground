import { mediaQuery } from './custom/media'
import { linkQuery } from './custom/link'

export const sectionFragments = `
	_key,
	_type,
	_type == 'textImageBlock' => {
		tag,
		title,
		text,
		${mediaQuery('image')},
		imageName,
		imageYear,
		${linkQuery('link')}
	}
`.trim()
