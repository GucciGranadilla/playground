import { useCallback, useEffect, useRef, useState } from 'react'
import a from '@/styles/ani.module.scss'
import t from '@/styles/text.module.scss'

interface Segment {
	text: string
	className?: string
}

type AsTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'

interface SplitTextProps {
	text?: string
	segments?: Segment[]
	type?: 'letters' | 'words' | 'lines'
	trigger?: 'ready' | 'scroll'
	delay?: number
	stagger?: number
	className?: string
	/** Render as a semantic heading or paragraph instead of <span>. */
	as?: AsTag
	/** Group rendered output into per-line clip masks. Requires measurement (post-fonts.ready). */
	wrap?: boolean
	/** aria-label on the root. `true` (default) uses the full text, a string overrides, `false` omits. */
	label?: string | boolean
}

type MeasuredWord = { word: string; className?: string }

export default function SplitText({
	text,
	segments,
	type = 'words',
	trigger = 'ready',
	delay = 0,
	stagger = 0.04,
	className,
	as,
	wrap = false,
	label = true,
}: SplitTextProps) {
	const source: Segment[] = segments ?? (text ? [{ text }] : [])
	const fullText = source.map((s) => s.text).join(' ').trim()
	const flatWords: MeasuredWord[] = source.flatMap((seg) =>
		seg.text
			.split(' ')
			.filter(Boolean)
			.map((word) => ({ word, className: seg.className }))
	)

	const needsMeasurement = wrap || type === 'lines'
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const Tag = (as ?? 'span') as any

	const rootRef = useRef<HTMLElement | null>(null)
	const [measuredLines, setMeasuredLines] = useState<MeasuredWord[][] | null>(null)

	const measure = useCallback(() => {
		requestAnimationFrame(() => {
			const root = rootRef.current
			if (!root) return
			const wordEls = Array.from(root.querySelectorAll<HTMLElement>('[data-word]'))
			if (!wordEls.length) return

			const rects = wordEls.map((el) => el.getBoundingClientRect())
			const lines: MeasuredWord[][] = []
			let currentLine: MeasuredWord[] = []
			let lastTop: number | null = null

			wordEls.forEach((el, i) => {
				const top = rects[i].top
				if (lastTop !== null && Math.abs(top - lastTop) > 1) {
					lines.push(currentLine)
					currentLine = []
				}
				currentLine.push({
					word: el.textContent ?? '',
					className: el.dataset.lineClass,
				})
				lastTop = top
			})
			if (currentLine.length) lines.push(currentLine)
			setMeasuredLines(lines)
		})
	}, [])

	// Measure after fonts load so line breaks reflect the final font metrics.
	useEffect(() => {
		if (!needsMeasurement) return
		let cancelled = false
		const run = async () => {
			try {
				await document.fonts?.ready
			} catch {
				// fonts API unavailable — measure immediately
			}
			if (cancelled) return
			measure()
		}
		run()
		return () => {
			cancelled = true
		}
	}, [needsMeasurement, measure, text, segments])

	// Re-measure on resize. Skip touch (orientation/keyboard reflows cause spurious churn).
	useEffect(() => {
		if (!needsMeasurement || typeof window === 'undefined') return
		const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0
		if (isTouch) return

		let timer: ReturnType<typeof setTimeout> | null = null
		const handler = () => {
			if (timer) clearTimeout(timer)
			timer = setTimeout(() => measure(), 150)
		}
		window.addEventListener('resize', handler)
		return () => {
			window.removeEventListener('resize', handler)
			if (timer) clearTimeout(timer)
		}
	}, [needsMeasurement, measure])

	const animClass = trigger === 'scroll' ? a.moveUpScroll : a.moveUp
	const ariaLabel = label === false ? undefined : typeof label === 'string' ? label : fullText
	const hideFromAT = ariaLabel ? true : undefined

	// ── Post-measurement: render lines, optionally with per-word stagger inside ──
	if (needsMeasurement && measuredLines) {
		return (
			<Tag className={className} ref={rootRef} aria-label={ariaLabel}>
				{measuredLines.map((line, li) => {
					const lineDelay = delay + li * stagger
					const lineText = line.map((w) => w.word).join(' ')

					if (type === 'lines') {
						return (
							<span key={li} className={t.lineClip} aria-hidden={hideFromAT}>
								<span
									className={animClass}
									style={
										{
											'--delay': `${lineDelay}s`,
											display: 'inline-block',
										} as React.CSSProperties
									}
								>
									{lineText}
								</span>
							</span>
						)
					}

					// wrap + words: line-shaped clip mask with per-word stagger inside
					return (
						<span key={li} className={t.lineClip} aria-hidden={hideFromAT}>
							{line.map(({ word, className: wc }, wi) => (
								<span key={wi}>
									{wi > 0 && ' '}
									<span
										className={`${animClass}${wc ? ` ${wc}` : ''}`}
										style={
											{
												'--delay': `${lineDelay + wi * stagger}s`,
												display: 'inline-block',
											} as React.CSSProperties
										}
									>
										{word}
									</span>
								</span>
							))}
						</span>
					)
				})}
			</Tag>
		)
	}

	// ── Pre-measurement render (only used when needsMeasurement) ──
	// Words are laid out so we can measure their visual line groupings; root is
	// invisible until measurement completes so the user doesn't see a flat flash
	// before the line reveal. aria-label keeps the content accessible.
	if (needsMeasurement) {
		return (
			<Tag
				className={className}
				ref={rootRef}
				aria-label={ariaLabel}
				style={{ opacity: 0 }}
			>
				{flatWords.map(({ word, className: wc }, i) => (
					<span key={i}>
						{i > 0 && ' '}
						<span
							data-word
							data-line-class={wc ?? undefined}
							style={{ display: 'inline-block' }}
						>
							{word}
						</span>
					</span>
				))}
			</Tag>
		)
	}

	// ── No-measurement path: original word/letter stagger ──
	if (type === 'words') {
		return (
			<Tag className={className} aria-label={ariaLabel}>
				{flatWords.map(({ word, className: wc }, i) => (
					<span key={i} aria-hidden={hideFromAT}>
						{i > 0 && ' '}
						<span className={t.lineClip}>
							<span
								className={`${animClass}${wc ? ` ${wc}` : ''}`}
								style={
									{
										'--delay': `${delay + i * stagger}s`,
										display: 'inline-block',
									} as React.CSSProperties
								}
							>
								{word}
							</span>
						</span>
					</span>
				))}
			</Tag>
		)
	}

	// letters
	const chars = (text ?? source.map((s) => s.text).join(' ') ?? '').split('')
	let animIndex = 0
	return (
		<Tag className={className} aria-label={ariaLabel}>
			{chars.map((char, i) => {
				if (char === ' ') return <span key={i}>{' '}</span>
				const idx = animIndex++
				return (
					<span key={i} className={t.lineClip} aria-hidden={hideFromAT}>
						<span
							className={animClass}
							style={
								{
									'--delay': `${delay + idx * stagger}s`,
									display: 'inline-block',
								} as React.CSSProperties
							}
						>
							{char}
						</span>
					</span>
				)
			})}
		</Tag>
	)
}
