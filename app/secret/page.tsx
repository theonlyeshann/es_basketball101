import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function SecretPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-8 text-white">
        • THE SECRET
      </h1>
      
      <p className="text-white font-mono mb-8 max-w-4xl mx-auto text-center">
        The secret that all great athletes know: there is no secret. Success comes from consistent 
        practice, dedication, and never giving up. The fundamentals you&apos;ve learned - fitness, 
        dribbling, passing, shooting, and basketball IQ - these are your tools. But the secret 
        ingredient is your commitment to improvement every single day.
      </p>
      
      <div className="mb-8">
        <Image
          src="/images/JAMORANT12-ATTACK.jpeg"
          alt="Ja Morant Attack"
          width={200}
          height={200}
          sizes="200px"
          priority
          className="rounded-3xl shadow-[8px_8px_0px_0px_#ffa500] mx-auto"
        />
      </div>
      
      <p className="text-white font-mono mb-8 italic">
        &ldquo;Hard work beats talent when talent doesn&apos;t work hard.&rdquo;
      </p>
      
      <Link href="/" className="inline-flex items-center min-h-11 text-white underline italic font-mono">
        Back to Home
      </Link>
    </div>
  )
}