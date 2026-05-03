import type { Metadata } from 'next'
import { Audiowide, Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const audiowide = Audiowide({ weight: '400', subsets: ['latin'], variable: '--font-audiowide' })
const barlow = Barlow({ weight: ['300','400','500','600'], subsets: ['latin'], variable: '--font-barlow' })
const barlowCondensed = Barlow_Condensed({ weight: ['600','700','800'], subsets: ['latin'], variable: '--font-barlow-condensed' })

export const metadata: Metadata = { title: 'Projektant24 CRM' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={`${audiowide.variable} ${barlow.variable} ${barlowCondensed.variable} font-body bg-paper text-black`}>
        {children}
      </body>
    </html>
  )
}
