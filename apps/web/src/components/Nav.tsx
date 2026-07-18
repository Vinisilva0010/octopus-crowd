import WalletButton from "./WalletButton";

export default function Nav() {
  return (
    <nav className="flex items-center justify-between p-4 border-b border-zinc-800">
      <div className="flex gap-4">
        <a href="/">Home</a>
        <a href="/ranking">Ranking</a>
        <a href="/profile">Perfil</a>
      </div>
      <WalletButton />
    </nav>
  );
}