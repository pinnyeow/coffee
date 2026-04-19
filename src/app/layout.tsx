import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pour',
  description: 'A coffee journal for pour over and espresso.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-stone-100 text-stone-900">{children}</body>
    </html>
  )
}
