import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CampanhaConvite({ apiFetch }) {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [campanha, setCampanha] = useState(null);
  const [fichas, setFichas] = useState([]);
  const [status, setStatus] = useState("carregando");

  useEffect(() => {
    if (!codigo) return setStatus("invalido");
    carregarCampanha();
  }, [codigo]);

  const carregarCampanha = async () => {
    try {
      const res = await apiFetch(`/campanhas/codigo/${codigo}`);
      if (!res.ok) throw new Error("Não encontrada");
      const data = await res.json();
      setCampanha(data);

      // Tenta carregar fichas da campanha
      const fichasRes = await apiFetch(`/campanhas/${data.id}/fichas`);
      const fichasData = await fichasRes.json();
      setFichas(fichasData);

      setStatus("ok");
    } catch (err) {
      setStatus("erro");
    }
  };

  const entrarNaCampanha = async () => {
    try {
      const res = await apiFetch(`/campanhas/${campanha.id}/entrar`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Erro ao entrar na campanha");
      alert("Você entrou na campanha!");
      carregarCampanha(); // recarrega para atualizar os dados
    } catch (err) {
      alert(err.message);
    }
  };

  if (status === "carregando") {
    return <p className="p-6 text-zinc-300">Carregando campanha...</p>;
  }

  if (status === "erro" || !campanha) {
    return (
      <div className="p-6 text-red-400">
        <h1 className="text-2xl font-bold mb-2">❌ Campanha não encontrada</h1>
        <button
          onClick={() => navigate("/campanhas")}
          className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-white"
        >
          Voltar para campanhas
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">📖 {campanha.nome}</h1>
      <p className="text-zinc-400 mb-4">{campanha.descricao}</p>

      <button
        onClick={entrarNaCampanha}
        className="mb-6 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg"
      >
        Entrar na Campanha
      </button>

      <h2 className="text-2xl font-semibold mb-2">Fichas da Campanha</h2>
      {fichas.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fichas.map((f) => (
            <li
              key={f.id}
              className="p-4 border border-zinc-700 bg-zinc-900 rounded-xl"
            >
              <div className="text-lg font-bold mb-1">{f.dados?.profile?.nome || "Sem nome"}</div>
              <div className="text-sm text-zinc-400">
                {f.dados?.profile?.jogador || "Jogador desconhecido"}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-zinc-500 italic">Nenhuma ficha adicionada ainda...</p>
      )}
    </div>
  );
}
