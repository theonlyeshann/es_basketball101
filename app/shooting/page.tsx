import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ShootingPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-3xl font-bold mb-8 text-white">
        • SHOOTING
      </h2>
      
      <p className="text-white font-mono mb-8 max-w-4xl mx-auto text-center">
        Shooting is the most obvious skill in basketball - it's how you score points. Good shooters 
        have consistent form, proper footwork, and follow through. Practice shooting from different 
        spots on the court, work on your free throws, and remember that great shooters are made 
        through thousands of repetitions.
      </p>
      
      <div className="mb-8">
        <Image
          src="/images/SC30-SHOOTING.jpeg"
          alt="Stephen Curry Shooting"
          width={200}
          height={200}
          className="rounded-3xl shadow-[8px_8px_0px_0px_#ffff00] mx-auto"
        />
      </div>
      
      <Link href="/" className="text-white italic font-mono">
        Back to Home
      </Link>
    </div>
  )
}