"use client";

import { usePathname } from "next/navigation";
import WalletButton from "./WalletButton";

export default function Nav() {
  const pathname = usePathname();
  if (pathname === "/how-it-works") return null;

  return (
    <nav className="flex items-center justify-between border-b-4 border-black bg-white px-4 py-3 sm:px-6">
      <a href="/" className="flex items-center gap-2">
        <img src="/polvo.png" alt="Octopus Crowd" className="w-8" />
        <span className="text-sm font-black uppercase leading-none sm:text-base">
          Octopus Crowd
          <span className="block font-mono text-[0.6rem] font-bold tracking-widest text-violet-700 sm:text-xs">
            × TxLINE
          </span>
        </span>
      </a>

      <div className="flex items-center gap-2 sm:gap-3">
        <a href="/" className="nav-chip nav-chip-violet">Home</a>
        <a href="/ranking" className="nav-chip nav-chip-blue">Ranking</a>
        <a href="/profile" className="nav-chip nav-chip-yellow">Profile</a>
        <a href="/docs" className="nav-chip">Docs</a>
        <WalletButton />
      </div>
    </nav>
  );
}