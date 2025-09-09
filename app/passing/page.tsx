import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function PassingPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-3xl font-bold mb-8 text-white">• PASSING</h2>
      
      <p className="text-white font-mono mb-8 max-w-4xl mx-auto text-center">
        Basketball is a team sport, and passing is what makes the team work together. Great passers 
        can see plays develop before they happen and deliver the ball exactly where and when their 
        teammates need it. Work on different types of passes: chest pass, bounce pass, overhead pass, 
        and always pass with purpose.
      </p>
      
      <div className="mb-8">
        <Image
          src="/images/JS12-PASSING.jpeg"
          alt="John Stockton Passing"
          width={200}
          height={200}
          className="rounded-3xl shadow-[8px_8px_0px_0px_#000080] mx-auto"
        />
      </div>
      
      <Link href="/" className="text-white italic font-mono">
        Back to Home
      </Link>
    </div>
  )
}