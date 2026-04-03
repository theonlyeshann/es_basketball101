import React from "react";
import Image from "next/image";
import Link from "next/link";

const skills = [
  {
    href: "/fitness",
    src: "/images/BRYANT24-WORKOUT.png",
    alt: "Kobe Workout",
    label: "Fitness",
    shadow: "#800080",
  },
  {
    href: "/dribbling",
    src: "/images/KI11-DRIBBLING.jpeg",
    alt: "Kyrie Dribble",
    label: "Dribbling",
    shadow: "#ffffff",
  },
  {
    href: "/passing",
    src: "/images/JS12-PASSING.jpeg",
    alt: "Stockton Pass",
    label: "Passing",
    shadow: "#000080",
  },
  {
    href: "/shooting",
    src: "/images/SC30-SHOOTING.jpeg",
    alt: "Curry Shot",
    label: "Shooting",
    shadow: "#ffff00",
  },
  {
    href: "/basketball-iq",
    src: "/images/STEVEKERR-COACHING.jpeg",
    alt: "Kerr Coach",
    label: "Basketball IQ",
    shadow: "#10ff00",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 text-center max-w-2xl">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-3 text-white drop-shadow-lg">
            Basketball 101
          </h1>
          <h3 className="text-xl mb-3 text-orange-200 font-sans">
            Dominating the basics is what you need to be great.
          </h3>
          <p className="text-white/70 font-mono text-sm">
            Master these fundamentals before moving on to advanced practices:
          </p>
        </div>

        <div className="space-y-6">
          {skills.map((skill) => (
            <div key={skill.href} className="flex flex-col items-center group">
              <Link href={skill.href} aria-label={skill.label}>
                <div className="relative mb-3">
                  <Image
                    src={skill.src}
                    alt={skill.alt}
                    width={200}
                    height={200}
                    className="rounded-3xl mx-auto transform transition-all duration-300 group-hover:scale-105 cursor-pointer"
                    style={{
                      boxShadow: `8px 8px 0px 0px ${skill.shadow}`,
                    }}
                  />
                </div>
              </Link>
              <Link
                href={skill.href}
                className="text-orange-200 italic font-mono text-sm hover:text-orange-400 transition-colors"
              >
                {skill.label}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-14 p-6 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm">
          <p className="text-white/70 font-mono text-sm mb-3">
            The secret all athletes keep to themselves:
          </p>
          <Link
            href="/secret"
            className="inline-block px-5 py-2 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 italic font-mono text-sm hover:bg-orange-500/40 hover:text-white transition-all duration-300"
          >
            Click here
          </Link>
        </div>

        <p className="mt-8 text-white/30 text-xs font-mono">
          💬 Chat with your AI coach — tap the orange button below
        </p>
      </div>
    </div>
  );
}
