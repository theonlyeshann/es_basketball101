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
        <main>
          {children}
        </main>
        <Chatbot />
      </body>
    </html>
  )
}