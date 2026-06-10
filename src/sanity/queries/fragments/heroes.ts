// Hero is currently an inline object on the page (not an array of variants),
// so this is a flat field list rather than a switch on `_type`. If you later
// move to an array of hero variants, convert this to a `_type == ...` switch.

export const heroFragments = `
	tag,
	title,
	version,
	scrollLabel
`.trim()
