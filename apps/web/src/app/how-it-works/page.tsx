"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function Slide({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.intersectionRatio > 0.6),
      { threshold: [0, 0.6, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="snap-slide">
      <div ref={ref} className={`slide-content ${active ? "slide-content-visible" : ""} px-4`}>
        {children}
      </div>
    </section>
  );
}

function ExplainSlide({
  eyebrow,
  title,
  text,
  image,
}: {
  eyebrow: string;
  title: string;
  text: string;
  image: string;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
      <img src={image} alt={title} className="w-40 sm:w-56" />
      <div className="panel">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-blue-700">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-black uppercase leading-tight text-black sm:text-4xl">{title}</h2>
        <p className="mt-3 text-lg font-bold text-zinc-700">{text}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const router = useRouter();

  function enterApp() {
    localStorage.setItem("octopus_seen_intro", "1");
    router.push("/");
  }

  return (
    <main className="relative overflow-x-hidden bg-violet-200">
      <div className="absolute left-0 top-0 z-10 h-1 w-full bg-gradient-to-r from-violet-700 via-blue-600 to-yellow-400" />

      <div className="snap-container">
        <Slide>
          <div className="flex flex-col items-center text-center">
            <img src="/polvo.png" alt="Octopus Crowd mascot" className="octopus-breathe w-[60vw] max-w-[300px]" />
            <h1 className="hero-title-outline mt-4 text-5xl font-black uppercase leading-[0.85] tracking-tight sm:text-7xl">
              Octopus Crowd
            </h1>
            <p className="mt-4 max-w-md text-lg font-bold text-black">The World Cup, reimagined by the crowd.</p>
            <p className="mt-8 animate-bounce font-mono text-sm font-bold text-violet-700">↓ scroll ↓</p>
          </div>
        </Slide>

        <Slide>
          <ExplainSlide
            eyebrow="The problem"
            title="You're already watching with your phone in hand."
            text="But the experience today is passive. Refresh a score, scroll a feed, wait for something to happen."
            image="/explain-problem.png"
          />
        </Slide>

        <Slide>
          <ExplainSlide
            eyebrow="What you do"
            title="Predict the next moment, live."
            text="Next goal. Next corner. Next card. One tap, before it happens — powered by TxLINE's real-time World Cup feed."
            image="/explain-predict.png"
          />
        </Slide>

        <Slide>
          <ExplainSlide
            eyebrow="Build your streak"
            title="Every correct call builds your streak."
            text="Climb the weekly leaderboard. One miss resets your streak — the board never lies."
            image="/explain-streak.png"
          />
        </Slide>

        <Slide>
          <ExplainSlide
            eyebrow="Your fan profile"
            title="Discover your fan instinct."
            text="The system learns how you read the game and builds a profile that says who you really are as a fan."
            image="/explain-profile.png"
          />
        </Slide>

        <Slide>
          <ExplainSlide
            eyebrow="Provably real"
            title="Not our word. Verifiable data."
            text="Every result is checked against a live cryptographic proof from the TxLINE oracle — not a sportsbook, not a black box."
            image="/explain-proof.png"
          />
        </Slide>

        <Slide>
          <div className="flex flex-col items-center gap-6 text-center">
            <img src="/polvo.png" alt="Octopus Crowd mascot" className="w-32" />
            <button onClick={enterApp} className="pick-btn pick-btn-violet px-10 py-5 text-xl">
              Enter the game
            </button>
          </div>
        </Slide>
      </div>
    </main>
  );
}