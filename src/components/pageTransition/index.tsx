'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, usePresence } from 'framer-motion'
import { useRouter } from 'next/router'

interface PageTransitionProps {
	children: ReactNode
}

interface WindowWithLenis extends Window {
	lenis?: {
		scroll: number
		stop: () => void
		start: () => void
		emit: () => void
	}
}

function PageContent({ children, exitScrollY }: { children: ReactNode; exitScrollY: number }) {
	const [isPresent, safeToRemove] = usePresence()
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [lockedHeight, setLockedHeight] = useState<string | number>('auto')

	return (
		<motion.div
			initial={{ clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(0)' }}
			animate={{ clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1)' }}
			exit={{
				clipPath: 'inset(0% 0% 100% 0%)',
				filter: 'brightness(0)',
			}}
			transition={{ duration: 1, ease: [0.5, 0, 0.15, 1] }}
			onAnimationStart={() => {
				setIsTransitioning(true)
				// Mobile Fix: Lock the height to pixels when exiting
				// to prevent the address bar from jumping the layout
				if (!isPresent) {
					setLockedHeight(window.innerHeight)
				}
			}}
			onAnimationComplete={() => {
				setIsTransitioning(false)
				if (!isPresent) {
					safeToRemove?.()
				} else {
					setLockedHeight('auto')
					// Refresh Lenis after overflow becomes visible again
					const lenis = (window as WindowWithLenis).lenis
					lenis?.emit()
				}
			}}
			style={{
				width: '100%',
				position: isPresent ? 'relative' : 'fixed',
				top: 0,
				left: 0,
				// Use locked height for exit, dvh for entrance, auto for settled
				height: isPresent ? (isTransitioning ? '100dvh' : 'auto') : lockedHeight,
				zIndex: isPresent ? 1 : 10,
				// STICKY FIX: Only hide overflow during the actual movement
				overflow: isPresent && !isTransitioning ? 'visible' : 'hidden',
			}}
		>
			<motion.div
				initial={{ y: 100 }}
				animate={{ y: 0 }}
				exit={{ y: -100 }}
				transition={{ duration: 1, ease: [0.5, 0, 0.15, 1] }}
				style={{
					width: '100%',
					position: 'relative',
					// Offset the fixed element so it appears where the user was scrolled
					marginTop: isPresent ? 0 : -exitScrollY,
					pointerEvents: isPresent ? 'auto' : 'none',
				}}
			>
				{children}
			</motion.div>
		</motion.div>
	)
}

export default function PageTransition({ children }: PageTransitionProps) {
	const router = useRouter()
	const [exitScrollY, setExitScrollY] = useState(0)

	// Use path as key to trigger transitions
	const routeKey = router.asPath.split(/[?#]/)[0]

	useEffect(() => {
		// NATIVE BROWSER CONTROL FIX:
		// Prevent browser from trying to handle scroll restoration
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual'
		}

		const handleRouteChangeStart = () => {
			const lenis = (window as WindowWithLenis).lenis
			const currentScroll = lenis ? lenis.scroll : window.scrollY
			setExitScrollY(currentScroll)
			lenis?.stop()
		}

		const handleRouteChangeComplete = () => {
			const lenis = (window as WindowWithLenis).lenis
			// Reset scroll instantly before the new page is revealed
			window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
			lenis?.start()
		}

		router.events.on('routeChangeStart', handleRouteChangeStart)
		router.events.on('routeChangeComplete', handleRouteChangeComplete)

		return () => {
			router.events.off('routeChangeStart', handleRouteChangeStart)
			router.events.off('routeChangeComplete', handleRouteChangeComplete)
		}
	}, [router])

	return (
		<AnimatePresence mode='popLayout' initial={false}>
			<PageContent key={routeKey} exitScrollY={exitScrollY}>
				{children}
			</PageContent>
		</AnimatePresence>
	)
}
