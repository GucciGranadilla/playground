// Section variants get registered as standalone types in src/sanity/schemas/index.ts
// and listed in the `of` array below as you create them.

const sections = (name: string, title: string) => [
	{
		name,
		title,
		type: 'array',
		group: name,
		of: [{ type: 'textImageBlock' }],
	},
]

export default sections
