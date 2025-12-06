import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EVBike - Xe Điện Thông Minh | Xe Điện Bán Chạy Hàng Đầu',
  description: 'Hệ thống xe điện thông minh với công nghệ tiên tiến, thiết kế hiện đại, giá cả hợp lý. Bảo hành chính hãng toàn diện.',
  keywords: 'xe điện, xe máy điện, xe đạp điện, xe điện thông minh, EVBike',
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
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
