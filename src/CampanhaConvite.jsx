import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CampanhaConvite({ apiFetch }) {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Carregando convite...");

  useEffect(() => {
    const entrarNaCampanha = async () => {
      try {
        const res = await apiFetch(`/campanhas/entrar/${codigo}`, {
          method: "POST",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erro ao entrar na campanha");
        }

        const data = await res.json();
        setStatus("✅ Você entrou na campanha!");

        // Redireciona para a campanha após 2 segundos
        setTimeout(() => {
          navigate("/campanhas");
        }, 2000);
      } catch (e) {
        setStatus(`❌ ${e.message}`);
      }
    };

    entrarNaCampanha();
  }, [codigo, apiFetch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-black text-white p-6">
      <div className="max-w-md bg-zinc-900 p-8 rounded-xl border border-zinc-700 text-center">
        <h1 className="text-2xl font-bold mb-4">🎲 Convite para Campanha</h1>
        <p className="text-zinc-300">{status}</p>
      </div>
    </div>
  );
}
