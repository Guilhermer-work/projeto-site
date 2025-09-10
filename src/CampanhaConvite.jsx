import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * Tela que abre quando alguém clica num link de convite /campanha/:codigo
 * Mostra dados básicos da campanha e botão para entrar.
 */
export default function CampanhaConvite({ apiFetch }) {
  const { codigo } = useParams();
  const [campanha, setCampanha] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    carregarCampanha();
  }, [codigo]);

  const carregarCampanha = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API || "https://pressagios-login.onrender.com"}/campanhas/publico/${codigo}`,
        { credentials: "include" } // permite cookies se necessário
      );
      if (!res.ok) {
        throw new Error("Convite inválido ou campanha não encontrada");
      }
      const data = await res.json();
      setCampanha(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const aceitarConvite = async () => {
    try {
      const res = await apiFetch(`/campanhas/${campanha.id}/aceitar`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao aceitar convite");
      }
      alert("Você entrou na campanha!");
      navigate("/campanhas");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Carregando convite...</p>
      </div>
    );
  }

  if (!campanha) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Convite inválido ou campanha não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">📖 Convite para campanha</h1>
      <div className="max-w-lg bg-zinc-900 p-6 rounded-xl border border-zinc-700 w-full">
        <h2 className="text-2xl font-semibold mb-2">{campanha.nome}</h2>
        <p className="text-zinc-400 mb-6">{campanha.descricao || "Sem descrição"}</p>

        <button
          onClick={aceitarConvite}
          className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
        >
          ➕ Entrar nesta campanha
        </button>
      </div>
    </div>
  );
}
