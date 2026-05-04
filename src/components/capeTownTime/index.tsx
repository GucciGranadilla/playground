import { useCapeTownTime } from '@/utils/useCapeTownTime'

interface CapeTownTimeProps {
	className?: string
	showStatus?: boolean
}

export default function CapeTownTime({ className, showStatus }: CapeTownTimeProps) {
	const { currentTime, isBusinessHours } = useCapeTownTime()

	if (!showStatus) {
		return <span className={className}>{currentTime}</span>
	}

	return (
		<span className={className} style={{ display: 'flex', alignItems: 'center', gap: '8rem' }}>
			<span style={{
				display: 'inline-block',
				width: '6rem',
				height: '6rem',
				borderRadius: '50%',
				flexShrink: 0,
				backgroundColor: isBusinessHours ? '#076b07' : '#960707',
			}} />
			<span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
				{currentTime}
			</span>
		</span>
	)
}
