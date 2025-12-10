import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Thương Hiệu YD - Xe Điện Thông Minh | Xe Máy & Xe Đạp Trợ Lực',
  description: 'Thương Hiệu YD - Giải pháp di chuyển xanh, an toàn và tiết kiệm. Xe máy điện, xe đạp trợ lực hiện đại với công nghệ tiên tiến.',
  keywords: 'xe điện, xe máy điện, xe đạp trợ lực, YD, Thương Hiệu YD, xe điện thông minh',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#00a651" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
