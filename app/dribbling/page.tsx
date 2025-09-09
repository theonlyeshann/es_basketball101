import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function DribblingPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-3xl font-bold mb-8 text-white">• DRIBBLING</h2>
      
      <p className="text-white font-mono mb-8 max-w-4xl mx-auto text-center">
        Ball handling is crucial for every player on the court. Good dribbling allows you to create 
        opportunities, break down defenses, and maintain possession. Practice different dribbling moves, 
        work on both hands equally, and always keep your head up to see the court while dribbling.
      </p>
      
      <div className="mb-8">
        <Image
          src="/images/KI11-DRIBBLING.jpeg"
          alt="Kyrie Dribbling"
          width={200}
          height={200}
          className="rounded-3xl shadow-[8px_8px_0px_0px_#ffffff] mx-auto"
        />
      </div>
      
      <Link href="/" className="text-white italic font-mono">
        Back to Home
      </Link>
    </div>
  )
}