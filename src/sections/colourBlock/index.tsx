import Link from 'next/link'
import ParallaxImage from '@/components/parallaxImage'
import s from './colourBlock.module.scss'

interface ColourBlockProps {
	page?: string
}

export default function ColourBlock({ page }: ColourBlockProps) {
	const src = page === 'home'
		? 'https://images.unsplash.com/photo-1694433031706-3ae7e9219551?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
		: '/images/697898787870b765501229.png'

	return (
		<section className={s.root}>
			<Link href={page === 'home' ? '/about' : '/'} className={s.block}>
				<ParallaxImage
					src={src}
					alt={page === 'home' ? 'Studio interior' : 'Space detail'}
					sizes="100vw"
					className={s.image}
				/>
			</Link>
		</section>
	)
}
