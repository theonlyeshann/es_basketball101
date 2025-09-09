import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4 text-white font-sans">
        Basketball 101
      </h1>
      
      <h3 className="text-xl mb-8 text-white font-sans">
        Dominating the basics is what you need to be great.
      </h3>

      <p className="mb-8 text-white font-mono text-center">
        Here are the basic skills to need to master before moving onto new advanced practices:
      </p>
      
      <div className="space-y-8">
        {/* Fitness Section */}
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <Image
              src="/images/BRYANT24-WORKOUT.png"
              alt="Kobe Workout"
              width={200}
              height={200}
              className="rounded-3xl shadow-[8px_8px_0px_0px_#800080] mx-auto transform transition-all duration-300 hover:scale-105 hover:shadow-[12px_12px_0px_0px_#800080] cursor-pointer"
            />
          </div>
          <Link href="/fitness" className="text-white italic font-mono block">
            Fitness
          </Link>
        </div>

        {/* Dribbling Section */}
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <Image
              src="/images/KI11-DRIBBLING.jpeg"
              alt="Kyrie Dribble"
              width={200}
              height={200}
              className="rounded-3xl shadow-[8px_8px_0px_0px_#ffffff]"
            />
          </div>
          <Link href="/dribbling" className="text-white italic font-mono block">
            Dribbling
          </Link>
        </div>

        {/* Passing Section */}
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <Image
              src="/images/JS12-PASSING.jpeg"
              alt="Stockton Pass"
              width={200}
              height={200}
              className="rounded-3xl shadow-[8px_8px_0px_0px_#000080]"
            />
          </div>
          <Link href="/passing" className="text-white italic font-mono block">
            Passing
          </Link>
        </div>

        {/* Shooting Section */}
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <Image
              src="/images/SC30-SHOOTING.jpeg"
              alt="Curry Shot"
              width={200}
              height={200}
              className="rounded-3xl shadow-[8px_8px_0px_0px_#ffff00]"
            />
          </div>
          <Link href="/shooting" className="text-white italic font-mono block">
            Shooting
          </Link>
        </div>

        {/* Basketball IQ Section */}
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <Image
              src="/images/STEVEKERR-COACHING.jpeg"
              alt="Kerr Coach"
              width={200}
              height={200}
              className="rounded-3xl shadow-[8px_8px_0px_0px_#10ff00]"
            />
          </div>
          <Link href="/basketball-iq" className="text-white italic font-mono block">
            Basketball IQ
          </Link>
        </div>
      </div>

      <div className="mt-12">
        <p className="text-white font-mono mb-4">
          The secret all athletes keep to themselves:
        </p>
        <Link href="/secret" className="text-white italic font-mono">
          Click here
        </Link>
      </div>
    </div>
  )
}