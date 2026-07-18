import WalletButton from "./WalletButton";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b-4 border-black bg-white">
      <div className="h-1 w-full bg-gradient-to-r from-violet-700 via-blue-600 to-yellow-400" />

      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center gap-2 overflow-x-auto sm:gap-4">
          <a href="/" className="nav-chip nav-chip-violet">
            Home
          </a>
          <a href="/ranking" className="nav-chip nav-chip-blue">
            Ranking
          </a>
          <a href="/profile" className="nav-chip nav-chip-yellow">
            Perfil
          </a>
        </div>

        <WalletButton />
      </div>
    </nav>
  );
}