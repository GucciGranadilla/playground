export const randomHue = Math.floor(Math.random() * 360)

export const hslToHex = (h: number, s: number, l: number): string => {
	s /= 100; l /= 100
	const a = s * Math.min(l, 1 - l)
	const f = (n: number) => {
		const k = (n + h / 30) % 12
		return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
			.toString(16).padStart(2, '0')
	}
	return `#${f(0)}${f(8)}${f(4)}`
}
