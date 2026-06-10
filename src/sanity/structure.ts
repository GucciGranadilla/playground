import { HomeIcon } from '@sanity/icons'
import type { StructureBuilder } from 'sanity/structure'

export const structure = (S: StructureBuilder) =>
	S.list()
		.title('Content')
		.items([
			S.documentListItem().id('homePage').schemaType('homePage').title('Home').icon(HomeIcon),
		])
