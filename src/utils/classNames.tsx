type ClassValue = string | number | boolean | undefined | null

export default function c(...classes: ClassValue[]): string {
	return classes.filter(Boolean).join(' ')
}
