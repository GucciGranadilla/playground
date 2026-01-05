import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

import s from './colourBlock.module.scss'
import t from '@/styles/text.module.scss'
import c from '@/utils/classNames'

interface ColourBlockProps {
	page?: string
}

export default function ColourBlock({ page }: ColourBlockProps) {
	const containerRef = useRef(null)

	const item = {
		src:
			page == 'home'
				? 'https://images.unsplash.com/photo-1694433031706-3ae7e9219551?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
				: 'https://images.unsplash.com/photo-1725432744965-1f2ac80d15ec?q=80&w=3271&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
	}

	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start start', 'end start'], // 'start end' means it starts as soon as it enters the bottom of screen
	})

	// 1. Create the transform
	// 1. Raw transform (no change here)
	const yRaw = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])

	// 2. Snappy Spring (High stiffness, low mass)
	const y = useSpring(yRaw, {
		stiffness: 1000, // Very high stiffness = instant reaction
		damping: 100, // High damping = no "bouncing" or oscillation
		mass: 0.1, // Very low mass = no heavy "delay" feeling
		restDelta: 0.001,
	})

	return (
		<section className={s.root} ref={containerRef} style={{ overflow: 'hidden' }}>
			<Link href={page === 'home' ? '/about' : '/'} className={s.block}>
				<picture
					className={s.image}
					style={{ display: 'block', overflow: 'hidden', position: 'relative' }}
				>
					<motion.img
						src={item.src}
						style={{
							y,
							willChange: 'transform',
							scale: 1, // Give it room to move without showing edges
							objectFit: 'cover',
							height: '120%', // Make the image taller than the container
							width: '100%',
							position: 'absolute',
							top: '-10%',
						}}
					/>
				</picture>
			</Link>
		</section>
	)
}
