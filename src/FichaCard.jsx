import React from "react";

export default function FichaCard({ ficha, onSelect, onDelete }) {
  return (
    <div
      onClick={() => onSelect(ficha.id)}
      className="cursor-pointer relative p-6 rounded-2xl
                 bg-gradient-to-br from-zinc-900 to-zinc-800
                 border border-zinc-700 hover:border-violet-500
                 hover:shadow-lg hover:shadow-violet-500/20
                 transition-all group"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(ficha.id);
        }}
        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
        title="Deletar Ficha"
      >
        ❌
      </button>

      <div className="absolute top-0 left-0 h-full w-1 bg-violet-600 rounded-l-2xl" />

      <div className="text-2xl font-bold text-white mb-1 group-hover:text-violet-300">
        {ficha.dados?.profile?.nome || "Personagem Sem Nome"}
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
        👤 {ficha.dados?.profile?.jogador || "Jogador Desconhecido"}
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-400">
        📖 {ficha.dados?.profile?.origem || "Sem origem"}
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
        ⚔️ {ficha.dados?.profile?.classe || "Sem classe"}
      </div>

      <div className="flex gap-2 text-xs font-medium">
        <span className="px-2 py-1 bg-red-600/40 rounded-md text-red-300">
          HP {ficha.dados?.hp?.atual}/{ficha.dados?.hp?.max}
        </span>
        <span className="px-2 py-1 bg-purple-600/40 rounded-md text-purple-300">
          SAN {ficha.dados?.san?.atual}/{ficha.dados?.san?.max}
        </span>
        <span className="px-2 py-1 bg-orange-600/40 rounded-md text-orange-300">
          ESF {ficha.dados?.esf?.atual}/{ficha.dados?.esf?.max}
        </span>
      </div>
    </div>
  );
}
