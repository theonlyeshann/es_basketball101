import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function BasketballIQPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-3xl font-bold mb-8 text-white">• BASKETBALL IQ</h2>
      
      <p className="text-white font-mono mb-8 max-w-4xl mx-auto text-center">
        This aspect of basketball is extremely overlooked by the younger players beginning their 
        journey into the sport, but is extremely valuable. Thing is, there is no step by step way 
        to develop your Basketball IQ. The best way to do so, like learning any other topic, is 
        learning from the best. Watch your favorite superstar players and decipher patterns they 
        follow in similar situations, or simply talk to your coach about how he sees your game 
        awareness and ask him/her for tips. Slowly, you'll see it coming to you.
      </p>
      
      <div className="mb-8">
        <Image
          src="/images/DRAYGREEN23-IQ.jpg"
          alt="Draymond Green IQ"
          width={200}
          height={200}
          className="rounded-3xl shadow-[8px_8px_0px_0px_#00e8ff] mx-auto"
        />
      </div>
      
      <Link href="/" className="text-white italic font-mono">
        Back to Home
      </Link>
    </div>
  )
}