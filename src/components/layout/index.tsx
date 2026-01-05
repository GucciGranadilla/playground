import { ReactNode } from 'react'

// import DesignGrid from 'components/designGrid'
// import Nav from 'components/nav'
// import Cursor from 'components/cursor'

interface LayoutProps {
	children: ReactNode
	page?: string
	settings?: unknown
	popup?: unknown
}

export default function Layout({ children, page, settings, popup }: LayoutProps) {
	return (
		<>
			{/* {process.env.NODE_ENV === 'development' ? (
				<DesignGrid col={12} mcol={8} light={false} />
			) : null} */}
			{/* <Cursor /> */}
			{/* <Nav page={page} settings={settings} popup={popup}> */}
			{children}
			{/* </Nav> */}
		</>
	)
}
