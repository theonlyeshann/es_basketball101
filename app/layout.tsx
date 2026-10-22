import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import Chatbot from '@/components/Chatbot'

export const metadata: Metadata = {
  title: 'Basketball 101',
  description: 'Learn the fundamentals of basketball',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="text-white min-h-screen">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:p-3 focus:bg-black focus:text-white">Skip to content</a>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Chatbot />
      </body>
    </html>
  )
}
