import React, { useState } from "react";

export default function CampanhaSheet({ campanha, onVoltar }) {
  const API = "https://pressagios.onrender.com";
  const [conviteLink, setConviteLink] = useState(null);

  // Gera link de convite
  const gerarConvite = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/campanhas/${campanha.id}/convite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.link) {
        setConviteLink(data.link);
      } else {
        alert(data.error || "Erro ao gerar convite");
      }
    } catch (err) {
      console.error("Erro ao gerar convite", err);
      alert("Erro ao gerar convite");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-6">
      <button
        onClick={onVoltar}
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
      >
        ⬅ Voltar
      </button>

      <h1 className="text-4xl font-extrabold text-center mb-8">
        🏰 {campanha.titulo || "Campanha Sem Nome"}
      </h1>

      {/* Dados básicos da campanha */}
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-700 shadow-md mb-8">
        <h2 className="text-2xl font-bold text-violet-400 mb-4">📖 Detalhes</h2>
        <pre className="whitespace-pre-wrap text-zinc-300">
          {JSON.stringify(campanha, null, 2)}
        </pre>
      </div>

      {/* Botão para mestre gerar convite */}
      <div className="text-center">
        <button
          onClick={gerarConvite}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold shadow-md hover:shadow-violet-500/30 transition-all"
        >
          🔗 Gerar link de convite
        </button>

        {conviteLink && (
          <div className="mt-6 p-4 bg-zinc-800 rounded-xl border border-violet-600">
            <p className="text-violet-300 font-medium">Compartilhe este link:</p>
            <a
              href={conviteLink}
              className="block mt-2 text-blue-400 hover:underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {conviteLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
