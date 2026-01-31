import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Providers } from '../components/providers'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal'],
})

export const metadata: Metadata = {
  title: 'ShadowStream - Private Payroll Platform',
  description: 'Production-ready private payroll platform for Web3 organizations on Solana',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable}`}>
      <body className={`${spaceGrotesk.className} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
