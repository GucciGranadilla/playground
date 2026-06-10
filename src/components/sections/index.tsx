import TextImageBlock from '@/sections/textImageBlock'

type Section = {
	_key: string
	_type: string
	[key: string]: any
}

type SectionsProps = {
	page?: { _id?: string; slug?: { current?: string }; sections?: Section[] }
	settings?: any
}

const sectionMap: Record<string, React.ComponentType<any>> = {
	textImageBlock: TextImageBlock,
}

export default function Sections({ page, settings }: SectionsProps) {
	if (!page?.sections) return null

	return (
		<>
			{page.sections.map((section, i) => {
				const Section = sectionMap[section._type]
				if (!Section) return null
				const uniqueKey = `${page._id || page.slug?.current || 'unknown'}-${section._type}-${i}`
				return <Section key={uniqueKey} section={section} page={page} settings={settings} />
			})}
		</>
	)
}
