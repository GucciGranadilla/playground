type StringOpts = {
	name: string
	title: string
	description?: string
	required?: boolean
	group?: string
}

const string = ({ name, title, description, required, group }: StringOpts) => ({
	name,
	title,
	type: 'string',
	description,
	group,
	validation: required ? (rule: any) => rule.required() : undefined,
})

export default string
