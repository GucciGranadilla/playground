import { useState, useEffect } from 'react'
import { DateTime } from 'luxon'

export function useCapeTownTime() {
	const [currentTime, setCurrentTime] = useState('')
	const [isBusinessHours, setIsBusinessHours] = useState(false)
	const [isTransitioning, setIsTransitioning] = useState(false)

	useEffect(() => {
		const updateTime = () => {
			const capeTownTime = DateTime.now().setZone('Africa/Johannesburg')
			const formattedTime = capeTownTime.toFormat('h:mm:ss a')
			const timezone = capeTownTime.toFormat('ZZZZ')
			setCurrentTime(`${formattedTime} (${timezone})`)

			const hour = capeTownTime.hour
			const newBusinessHours = hour >= 9 && hour < 17
			if (newBusinessHours !== isBusinessHours) {
				setIsTransitioning(true)
				setTimeout(() => setIsTransitioning(false), 1000)
			}
			setIsBusinessHours(newBusinessHours)
		}

		updateTime()
		const interval = setInterval(updateTime, 1000)
		return () => clearInterval(interval)
	}, [isBusinessHours])

	return { currentTime, isBusinessHours, isTransitioning }
}
