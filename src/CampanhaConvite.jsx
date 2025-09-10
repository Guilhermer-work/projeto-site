import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CampanhaConvite({ apiFetch }) {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [campanha, setCampanha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await apiFetch(`/campanhas/convite/${codigo}`);
        if (!res.ok) throw new Error("Convite inválido ou expirado");
        const data = await res.json();
        setCampanha(data);
      } catch (e) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [codigo]);

  const aceitarConvite = async () => {
    try {
      const res = await apiFetch(`/campanhas/aceitar/${codigo}`, { method: "POST" });
      if (!res.ok) throw new Error("Erro ao aceitar convite");
      navigate("/"); // volta para a lista de campanhas
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p className="text-zinc-400 p-8">Carregando convite...</p>;
  if (erro) return <p className="text-red-400 p-8">{erro}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-4">📖 Convite para Campanha</h1>
        <p className="text-lg mb-6">
          Você foi convidado para participar da campanha:
        </p>
        <div className="p-4 mb-6 rounded-lg bg-zinc-800 border border-zinc-700">
          <h2 className="text-xl font-semibold">{campanha.nome}</h2>
          <p className="text-zinc-400">{campanha.descricao || "Sem descrição"}</p>
        </div>
        <button
          onClick={aceitarConvite}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg"
        >
          Aceitar Convite
        </button>
      </div>
    </div>
  );
}
