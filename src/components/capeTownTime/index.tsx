import { useCapeTownTime } from '@/utils/useCapeTownTime'

interface CapeTownTimeProps {
	className?: string
}

export default function CapeTownTime({ className }: CapeTownTimeProps) {
	const { currentTime } = useCapeTownTime()

	return (
		<span className={className}>
			{currentTime}
		</span>
	)
}
