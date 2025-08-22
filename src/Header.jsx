import React from "react";

export default function Header({ onNavigate }) {
  return (
    <header className="sticky top-0 z-10 border-b border-violet-700/40 bg-zinc-950/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        {/* Logo/Marca */}
        <div className="flex items-center gap-2 text-violet-400 font-semibold tracking-widest">
          <span className="w-2 h-2 bg-violet-500 rounded-full" /> Presságios
        </div>

        {/* Navegação */}
        <nav className="hidden md:flex gap-6 text-sm text-zinc-300">
          <button
            className="hover:text-white"
            onClick={() => onNavigate("personagens")}
          >
            Personagens
          </button>
          <button
            className="hover:text-white"
            onClick={() => onNavigate("campanhas")}
          >
            Campanhas
          </button>
        </nav>
      </div>
    </header>
  );
}
