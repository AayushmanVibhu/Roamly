import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  metadataBase: new URL('https://roamly.app'),
  title: 'Roamly - Smart Travel Decisions',
  description: 'AI-powered travel decision platform that helps you find the best travel options based on your constraints and preferences.',
  keywords: 'travel, flights, AI travel assistant, trip planning, flight search, best travel deals',
  authors: [{ name: 'Roamly' }],
  openGraph: {
    title: 'Roamly - Smart Travel Decisions',
    description: 'AI-powered travel decision platform that helps you find the best travel options based on your constraints and preferences.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${inter.className} bg-dark-950 text-dark-50`}>
        {children}
      </body>
    </html>
  )
}
