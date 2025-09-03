import React, { useState } from "react";

export default function CampanhaSheet({ campanha, onUpdate, onVoltar }) {
  const [titulo, setTitulo] = useState(campanha?.titulo || "Nova Campanha");
  const [descricao, setDescricao] = useState(campanha?.descricao || "");
  const [jogadores, setJogadores] = useState(campanha?.jogadores || []);

  // Atualiza campanha sempre que mudar algo
  const salvar = () => {
    onUpdate({ titulo, descricao, jogadores });
  };

  const adicionarJogador = () => {
    const nome = prompt("Nome do jogador:");
    if (nome) {
      const novosJogadores = [...jogadores, { nome }];
      setJogadores(novosJogadores);
      onUpdate({ titulo, descricao, jogadores: novosJogadores });
    }
  };

  const removerJogador = (index) => {
    const novosJogadores = jogadores.filter((_, i) => i !== index);
    setJogadores(novosJogadores);
    onUpdate({ titulo, descricao, jogadores: novosJogadores });
  };

  const gerarLinkConvite = () => {
    const link = `${window.location.origin}/campanha/${campanha.id}`;
    navigator.clipboard.writeText(link);
    alert("🔗 Link de convite copiado: " + link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-6">
      <button
        onClick={onVoltar}
        className="mb-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
      >
        ⬅ Voltar
      </button>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="p-6 bg-zinc-900 border border-zinc-700 rounded-2xl">
          <label className="block text-sm text-zinc-400 mb-2">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={salvar}
            className="w-full bg-transparent border-b border-zinc-600 focus:border-violet-500 outline-none text-xl font-bold"
          />
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-700 rounded-2xl">
          <label className="block text-sm text-zinc-400 mb-2">Descrição / Notas do Mestre</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onBlur={salvar}
            rows={6}
            className="w-full bg-transparent border border-zinc-600 focus:border-violet-500 outline-none text-white rounded-lg p-3"
          />
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-700 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Jogadores</h2>
            <button
              onClick={adicionarJogador}
              className="px-3 py-1 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm"
            >
              ➕ Adicionar
            </button>
          </div>

          {jogadores.length > 0 ? (
            <ul className="space-y-2">
              {jogadores.map((j, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-zinc-800 px-4 py-2 rounded-lg"
                >
                  <span>{j.nome}</span>
                  <button
                    onClick={() => removerJogador(i)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 italic">Nenhum jogador adicionado ainda...</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={gerarLinkConvite}
            className="px-6 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
          >
            🔗 Gerar link de convite
          </button>
        </div>
      </div>
    </div>
  );
}
