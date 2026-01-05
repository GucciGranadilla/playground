import { ReactNode, useEffect } from 'react'
import Lenis from 'lenis'

interface LenisProviderProps {
	children: ReactNode
}

interface WindowWithLenis extends Window {
	lenis?: Lenis
}

export default function LenisProvider({ children }: LenisProviderProps) {
	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			smoothWheel: true,
		})

		if (typeof window !== 'undefined') {
			;(window as WindowWithLenis).lenis = lenis
		}

		function raf(time: number) {
			lenis.raf(time)
			requestAnimationFrame(raf)
		}

		requestAnimationFrame(raf)

		return () => {
			lenis.destroy()
			if (typeof window !== 'undefined') {
				;(window as WindowWithLenis).lenis = undefined
			}
		}
	}, [])

	return <>{children}</>
}
