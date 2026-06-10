export const CUSTOM_EASES = {
	// Standard eases
	quartIn: '.5, 0, .75, 0',
	quartOut: '.25, 1, .5, 1',
	quartInOut: '.75, 0, .25, 1',
	in1: '.33, 0, .68, 0',
	out1: '.33, 1, .68, 1',
	inOut1: '.65, 0, .35, 1',
	in2: '.8, 0, .6, .6',
	out2: '.4, .4, .1, 1',
	inOut2: '.8, 0, .2, 1',
	// Enhanced eases
	i1: '.47, 0, .745, .715',
	o1: '.39, .575, .565, 1',
	io1: '.445, .05, .55, .95',
	i2: '.55, .085, .68, .53',
	o2: '.25, .46, .45, .94',
	io2: '.455, .03, .515, .955',
	i3: '.55, .055, .675, .19',
	o3: '.215, .61, .355, 1',
	io3: '.645, .045, .355, 1',
	i4: '.895, .03, .685, .22',
	o4: '.165, .84, .44, 1',
	io4: '.77, 0, .175, 1',
	i5: '.755, .05, .855, .06',
	o5: '.23, 1, .32, 1',
	io5: '.86, 0, .07, 1',
	i6: '.95, .05, .795, .035',
	o6: '.19, 1, .22, 1',
	io6: '1, 0, 0, 1',
	ioC: '.6, 0, .1, 1',
	ioC2: '.5, 0, .15, 1',
	// Sine eases
	sineIn: '.12, 0, .39, 0',
	sineOut: '.61, 1, .88, 1',
	sineInOut: '.37, 0, .63, 1',
	// Quad eases (easings.net style)
	quadIn: '.11, 0, .5, 0',
	quadOut: '.5, 1, .89, 1',
	quadInOut: '.45, 0, .55, 1',
	// Cubic eases (easings.net style)
	cubicIn: '.32, 0, .67, 0',
	cubicOut: '.33, 1, .68, 1',
	cubicInOut: '.65, 0, .35, 1',
	// Quint eases (easings.net style)
	quintIn: '.64, 0, .78, 0',
	quintOut: '.22, 1, .36, 1',
	quintInOut: '.83, 0, .17, 1',
	// Expo eases (easings.net style)
	expoIn: '.7, 0, .84, 0',
	expoOut: '.16, 1, .3, 1',
	expoInOut: '.87, 0, .13, 1',
	// Circ eases (easings.net style)
	circIn: '.55, 0, 1, .45',
	circOut: '0, .55, .45, 1',
	circInOut: '.85, 0, .15, 1',
	// Out family
	no1: '.65, 1, .9, 1',
	no2: '.5, 1, .89, 1',
	no3: '.33, 1, .68, 1',
	no4: '.25, 1, .5, 1',
	no5: '.22, 1, .36, 1',
	no6: '.19, 1, .22, 1',
	// In-out family
	nio1: '.37, 0, .63, 1',
	nio2: '.45, 0, .55, 1',
	nio23: '.48, 0, .52, 1',
	nio3: '.65, 0, .35, 1',
	nio4: '.76, 0, .24, 1',
	nio5: '.83, 0, .17, 1',
	nio6: '.87, 0, .13, 1',
	// In family
	ni1: '.12, 0, .39, 0',
	ni2: '.11, 0, .5, 0',
	ni3: '.32, 0, .67, 0',
	ni4: '.5, 0, .75, 0',
	ni5: '.64, 0, .78, 0',
	ni6: '.7, 0, .84, 0',
}

// Wrap each ease in cubic-bezier() for CSS compatibility
export const CUBIC_EASES = Object.fromEntries(
	Object.entries(CUSTOM_EASES).map(([key, value]) => [key, `cubic-bezier(${value})`])
)