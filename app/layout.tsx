import type { Metadata } from 'next'
import './globals.css'
import { AppLayout } from '@/components/layout/AppLayout'

export const metadata: Metadata = {
  title: 'CoffeePlace Founder MBA OS',
  description: 'Your founder operating system for building CoffeePlace into a regional specialty coffee brand',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  )
}
