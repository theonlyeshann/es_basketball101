import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function FitnessPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-3xl font-bold mb-8 text-white">• FITNESS</h2>
      
      <p className="text-white font-mono mb-8 max-w-4xl mx-auto text-center">
        This is probably the most important fundamental of basketball. This is where it all starts. 
        Without proper fitness and strength, you cannot effectively execute the other fundamentals. 
        Having great fitness means being able to play at your highest level for the longest amount 
        of time possible. Fitness is what separates the good from the great.
      </p>
      
      <div className="mb-8">
        <Image
          src="/images/DROZAN10_WORKOUT.jpeg"
          alt="DeRozan Workout"
          width={200}
          height={200}
          className="rounded-3xl shadow-[8px_8px_0px_0px_#ff0000] mx-auto"
        />
      </div>
      
      <Link href="/" className="text-white italic font-mono">
        Back to Home
      </Link>
    </div>
  )
}