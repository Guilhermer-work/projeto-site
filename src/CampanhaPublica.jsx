import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CampanhaPublica() {
  const { id } = useParams();
  const [campanha, setCampanha] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`https://pressagios-login.onrender.com/campanhas/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Não foi possível carregar a campanha.");
        return res.json();
      })
      .then((data) => setCampanha(data))
      .catch((err) => setErro(err.message));
  }, [id]);

  if (erro) return <div className="p-6 text-red-400">{erro}</div>;
  if (!campanha) return <div className="p-6 text-zinc-400">Carregando campanha...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-violet-400">{campanha.titulo}</h1>
        {campanha.dados?.descricao && (
          <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
            <p className="text-zinc-300 whitespace-pre-wrap">{campanha.dados.descricao}</p>
          </div>
        )}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Jogadores</h2>
          {campanha.dados?.jogadores?.length > 0 ? (
            <ul className="list-disc pl-6 space-y-1 text-zinc-300">
              {campanha.dados.jogadores.map((j, i) => (
                <li key={i}>{j.nome}</li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 italic">Nenhum jogador adicionado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
