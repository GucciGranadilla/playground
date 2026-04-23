import { useEffect, useState } from 'react'

export default function useMobile() {
	const [width, setWidth] = useState<number | null>(null)

	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth)
		setTimeout(() => handleResize(), 1)
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return width == null ? undefined : width <= 480
}
