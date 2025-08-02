import type { Metadata } from 'next'
// 1. Importar a fonte Raleway em vez da Inter
import { Raleway } from 'next/font/google'
import './globals.css'

// 2. Configurar e instanciar a Raleway com os pesos desejados
const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway', // Cria uma variável CSS para ser usada pelo Tailwind
  weight: ['300', '400', '500', '700'] // Pesos que você planeja usar
});

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
      {/* 3. Aplicar a classe da nova fonte ao corpo da página */}
      <body className={raleway.className}>{children}</body>
    </html>
  )
}
