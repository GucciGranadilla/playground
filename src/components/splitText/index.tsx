import a from '@/styles/ani.module.scss'
import t from '@/styles/text.module.scss'

interface Segment {
	text: string
	className?: string
}

interface SplitTextProps {
	text?: string
	segments?: Segment[]
	type?: 'letters' | 'words'
	trigger?: 'ready' | 'scroll'
	delay?: number
	stagger?: number
	className?: string
}

export default function SplitText({
	text,
	segments,
	type = 'words',
	trigger = 'ready',
	delay = 0,
	stagger = 0.04,
	className,
}: SplitTextProps) {
	const animClass = trigger === 'scroll' ? a.moveUpScroll : a.moveUp

	if (type === 'words') {
		const allWords: { word: string; className?: string }[] = []
		const source = segments ?? (text ? [{ text }] : [])
		for (const seg of source) {
			seg.text.split(' ').filter(Boolean).forEach(word => allWords.push({ word, className: seg.className }))
		}
		return (
			<span className={className}>
				{allWords.map(({ word, className: wc }, i) => (
					<span key={i}>
						{i > 0 && ' '}
						<span className={t.lineClip}>
							<span
								className={`${animClass}${wc ? ` ${wc}` : ''}`}
								style={{ '--delay': `${delay + i * stagger}s`, display: 'inline-block' } as React.CSSProperties}
							>
								{word}
							</span>
						</span>
					</span>
				))}
			</span>
		)
	}

	const chars = (text ?? '').split('')
	let animIndex = 0

	return (
		<span className={className}>
			{chars.map((char, i) => {
				if (char === ' ') return <span key={i}>{' '}</span>
				const idx = animIndex++
				return (
					<span key={i} className={t.lineClip}>
						<span
							className={animClass}
							style={{ '--delay': `${delay + idx * stagger}s`, display: 'inline-block' } as React.CSSProperties}
						>
							{char}
						</span>
					</span>
				)
			})}
		</span>
	)
}
