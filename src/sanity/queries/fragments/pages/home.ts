import { client } from '../../../lib/client'
import { sectionFragments } from '../sections'
import { heroFragments } from '../heroes'
import { seoQuery } from '../custom/seo'

export const homePageQuery = `
	*[_type == "homePage"][0] {
		...,
		${seoQuery('seo')},
		hero {
			${heroFragments}
		},
		sections[]{
			${sectionFragments}
		}
	}
`

export const getHomePageData = async () => {
	return await client.fetch(homePageQuery)
}
