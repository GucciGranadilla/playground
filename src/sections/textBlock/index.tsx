'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import s from './textBlock.module.scss'
import t from '@/styles/text.module.scss'
import c from '@/utils/classNames'

interface TextBlockProps {
	page?: string
}

function ParallaxImage({ src }: { src: string }) {
	const ref = useRef(null)

	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ['start end', 'end start'],
	})

	// Symmetrical transform: -15% to 15% ensures it's centered when mid-screen
	const yRaw = useTransform(scrollYProgress, [0, 1], ['-10%', '10%'])

	const y = useSpring(yRaw, {
		stiffness: 1000, // Very high stiffness = instant reaction
		damping: 100, // High damping = no "bouncing" or oscillation
		mass: 0.1, // Very low mass = no heavy "delay" feeling
		restDelta: 0.001,
	})

	return (
		<picture className={s.image} ref={ref}>
			<motion.img
				src={src}
				style={{
					y,
					willChange: 'transform',
					// Scale 1.3 provides enough "extra" image to cover the 15% travel
					// in both directions without showing the background.
					scale: 1,
					height: '100%',
					width: '100%',
					objectFit: 'cover',
				}}
			/>
		</picture>
	)
}

export default function TextBlock({ page }: TextBlockProps) {
	const items = [
		{
			src: 'https://images.unsplash.com/photo-1696178948866-7a9133a0fc3c?q=80&w=3732&auto=format&fit=crop',
		},
		{
			src: 'https://images.unsplash.com/photo-1725432744965-1f2ac80d15ec?q=80&w=3271&auto=format&fit=crop',
		},
		{
			src: 'https://images.unsplash.com/photo-1699138346782-8a8b211c3da2?q=80&w=3732&auto=format&fit=crop',
		},
		{
			src: 'https://images.unsplash.com/photo-1690984653071-37d5f9b07a29?q=80&w=3270&auto=format&fit=crop',
		},
	]

	return (
		<section className={s.root}>
			<div className={s.content}>
				<div className={c(s.title, t.xl)}>Section Heading</div>
				<div className={c(s.body, t.p)}>
					Framer Motion handles hardware acceleration automatically, making this parallax smooth
					even on mobile devices when paired with Lenis.
				</div>
			</div>
			<div className={s.blocks}>
				{items.map((item, i) => (
					<Link href={page === 'home' ? '/about' : '/'} className={s.block} key={i}>
						<ParallaxImage src={item.src} />
					</Link>
				))}
			</div>
		</section>
	)
}
