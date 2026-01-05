import '@/styles/globals.scss'
import type { AppProps } from 'next/app'
import Layout from '@/components/layout'
import PageTransition from '@/components/pageTransition'
import LenisProvider from '@/components/lenisProvider'

export default function App({ Component, pageProps }: AppProps) {
	return (
		<LenisProvider>
			<PageTransition>
				<Layout page={pageProps.page} settings={pageProps.settings} popup={pageProps.popup}>
					<Component {...pageProps} />
				</Layout>
			</PageTransition>
		</LenisProvider>
	)
}
