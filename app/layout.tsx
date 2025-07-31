import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mapa Astral - Gerador de Mapas Astrológicos',
  description: 'Descubra seu mapa astral personalizado com precisão astronômica. Explore as posições planetárias no momento do seu nascimento.',
  keywords: 'mapa astral, astrologia, planetas, signos, horóscopo, nascimento',
  authors: [{ name: 'Mapa Astral App' }],
  openGraph: {
    title: 'Mapa Astral - Gerador de Mapas Astrológicos',
    description: 'Descubra seu mapa astral personalizado com precisão astronômica.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}