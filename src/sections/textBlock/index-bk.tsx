'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import s from './textBlock.module.scss'
import t from '@/styles/text.module.scss'
import c from '@/utils/classNames'

// Register GSAP plugin
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

interface TextBlockProps {
	page?: string
}

function ImageBlock({ src }: { src: string }) {
	const imageRef = useRef<HTMLImageElement>(null)

	useEffect(() => {
		if (!imageRef.current) return

		const img = imageRef.current

		// Create parallax effect
		const parallaxTl = gsap.to(img, {
			yPercent: 30,
			ease: 'none',
			scrollTrigger: {
				trigger: img.parentElement,
				start: 'top bottom',
				end: 'bottom top',
				scrub: true,
				invalidateOnRefresh: true,
			},
		})

		return () => {
			parallaxTl.kill()
			parallaxTl.scrollTrigger?.kill()
		}
	}, [])

	return (
		<picture className={s.image}>
			<img ref={imageRef} src={src} alt="" />
		</picture>
	)
}

function Block({ src, href, className }: { src: string; href: string; className?: string }) {
	return (
		<div className={`${s.block} ${className || ''}`}>
			<Link href={href}>
				<ImageBlock src={src} />
			</Link>
		</div>
	)
}

export default function TextBlock({ page }: TextBlockProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const blocksRef = useRef<HTMLDivElement>(null)

	const items = [
		{ src: 'https://assets.awwwards.com/awards/submissions/2026/01/697898787870b765501229.png' },
		{ src: 'https://images.unsplash.com/photo-1725432744965-1f2ac80d15ec?q=80&w=3271&auto=format&fit=crop' },
		{ src: 'https://images.unsplash.com/photo-1699138346782-8a8b211c3da2?q=80&w=3732&auto=format&fit=crop' },
		{ src: 'https://images.unsplash.com/photo-1690984653071-37d5f9b07a29?q=80&w=3270&auto=format&fit=crop' },
	]

	useEffect(() => {
		if (!blocksRef.current) return

		const blocks = blocksRef.current.querySelectorAll(`.${s.block}`)
		if (blocks.length === 0) return

		const duration = 0.5

		// Create GSAP timeline with ScrollTrigger
		const tl = gsap.timeline({
			defaults: {
				ease: 'none',
				duration: duration,
			},
			scrollTrigger: {
				trigger: blocksRef.current,
				start: 'top 40%',
				end: () => `bottom top`,
				scrub: true,
				invalidateOnRefresh: true,
				markers: true
			},
		})

		// Set initial state (matches CSS default: 50%/250rem)
		tl.set(blocks, {
			width: '50%',
			height: '250rem',
		})

		// First block starts at largest size
		tl.set(blocks[0], {
			width: '100%',
			height: '500rem',
		})

		// Animate TO large size
		tl.to(blocks, {
			width: '100%',
			height: '500rem',
			stagger: duration,
			immediateRender: false,
		})

		// Animate back TO small size
		tl.to(
			blocks,
			{
				width: '50%',
				height: '250rem',
				stagger: duration,
				immediateRender: false,
			},
			duration
		)

		// Cleanup
		return () => {
			tl.kill()
			tl.scrollTrigger?.kill()
		}
	}, [])

	return (
		<section className={s.root} ref={containerRef}>
			<div className={s.content}>
				{/* <div className={c(s.title, t.xl)}>Section Heading</div> */}
				<div className={c(s.body, t.l)}>
					Full service digital experience studio. I work with bold, forward thinking brands to make experiences as impactful as the brands they are for. My approach is rooted in collaboration, we work with friends and other creative teams to achieve results.
				</div>
			</div>
			<div className={s.blocks} ref={blocksRef}>
				{items.map((item, i) => (
					<Block key={i} src={item.src} href={page === 'home' ? '/about' : '/'} />
				))}
			</div>
		</section>
	)
}
