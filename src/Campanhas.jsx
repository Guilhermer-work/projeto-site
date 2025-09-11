import React, { useState, useEffect } from "react";

export default function Campanhas({ apiFetch, fichas, onAbrirFicha, usuarioAtual }) {
  const [campanhas, setCampanhas] = useState([]);
  const [novaCampanha, setNovaCampanha] = useState({ nome: "", descricao: "" });
  const [campanhaAtiva, setCampanhaAtiva] = useState(null);
  const [fichasCampanha, setFichasCampanha] = useState([]);
  const [fichaSelecionada, setFichaSelecionada] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("fichas");
  const [membros, setMembros] = useState([]);
  const [fichaConfig, setFichaConfig] = useState(null);

  useEffect(() => {
    carregarCampanhas();
  }, []);

  async function carregarCampanhas() {
    try {
      const res = await apiFetch("/campanhas");
      if (!res.ok) return;
      const data = await res.json();
      setCampanhas(data);
    } catch (err) {
      console.error("Erro ao carregar campanhas", err);
    }
  }

  async function criarCampanha() {
    if (!novaCampanha.nome.trim()) return alert("Digite um nome para a campanha");
    try {
      const res = await apiFetch("/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaCampanha),
      });
      const created = await res.json();
      setCampanhas([created, ...campanhas]);
      setNovaCampanha({ nome: "", descricao: "" });
      abrirCampanha(created);
    } catch (err) {
      alert("Erro ao criar campanha");
    }
  }

  async function carregarFichasCampanha(campanhaId) {
    try {
      const res = await apiFetch(`/campanhas/${campanhaId}/fichas`);
      const data = await res.json();
      setFichasCampanha(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function carregarMembros(campanhaId) {
    try {
      const res = await apiFetch(`/campanhas/${campanhaId}/membros`);
      const data = await res.json();
      setMembros(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  function abrirCampanha(campanha) {
    setCampanhaAtiva(campanha);
    setAbaAtiva("fichas");
    carregarFichasCampanha(campanha.id);
    carregarMembros(campanha.id);
  }

  async function adicionarFicha() {
    if (!fichaSelecionada) return;
    try {
      await apiFetch(`/campanhas/${campanhaAtiva.id}/add-ficha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fichaId: Number(fichaSelecionada) }),
      });
      setFichaSelecionada("");
      carregarFichasCampanha(campanhaAtiva.id);
    } catch (err) {
      console.error(err);
    }
  }

  function copiarLinkConvite() {
    if (!campanhaAtiva?.codigo) return;
    const link = `${window.location.origin}/campanha/${campanhaAtiva.codigo}`;
    navigator.clipboard.writeText(link).then(() => alert("Link copiado!"));
  }

  async function deletarCampanha() {
    if (!campanhaAtiva) return;
    if (!window.confirm("Tem certeza que deseja deletar esta campanha?")) return;
    try {
      await apiFetch(`/campanhas/${campanhaAtiva.id}`, { method: "DELETE" });
      setCampanhaAtiva(null);
      carregarCampanhas();
    } catch (err) {
      console.error("Erro ao deletar campanha", err);
    }
  }

  async function salvarConfigFicha(fichaId, updates) {
    try {
      await apiFetch(`/fichas/${fichaId}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setFichaConfig({ ...fichaConfig, ...updates });
      carregarFichasCampanha(campanhaAtiva.id);
    } catch (err) {
      console.error("Erro ao salvar config da ficha", err);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-8">
      {!campanhaAtiva ? (
        <>
          <h1 className="text-3xl font-bold mb-6">📚 Minhas Campanhas</h1>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {campanhas.map((c) => (
              <div key={c.id} onClick={() => abrirCampanha(c)} className="cursor-pointer p-6 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-violet-500">
                <div className="text-xl font-bold">{c.nome}</div>
                <div className="text-sm text-zinc-400">{c.descricao || "Sem descrição"}</div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 max-w-lg">
            <h2 className="text-xl font-semibold mb-4">➕ Criar Nova Campanha</h2>
            <input type="text" placeholder="Nome" value={novaCampanha.nome} onChange={(e) => setNovaCampanha({ ...novaCampanha, nome: e.target.value })} className="w-full p-2 mb-3 bg-zinc-800 border border-zinc-700 rounded-lg" />
            <textarea placeholder="Descrição" value={novaCampanha.descricao} onChange={(e) => setNovaCampanha({ ...novaCampanha, descricao: e.target.value })} className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-700 rounded-lg" />
            <button onClick={criarCampanha} className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg">Criar</button>
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setCampanhaAtiva(null)} className="mb-6 px-4 py-2 bg-zinc-700 rounded-lg">← Voltar</button>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">📖 {campanhaAtiva.nome}</h1>
            <div className="flex gap-2">
              <button onClick={copiarLinkConvite} className="px-4 py-2 bg-violet-600 rounded-lg">📋 Copiar link</button>
              {campanhaAtiva.user_id === usuarioAtual.id && (
                <button onClick={deletarCampanha} className="px-4 py-2 bg-red-600 rounded-lg">🗑️ Deletar</button>
              )}
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-4 border-b border-zinc-700 mb-6">
            <button className={abaAtiva === "fichas" ? "border-b-2 border-violet-500 text-white" : "text-zinc-400"} onClick={() => setAbaAtiva("fichas")}>📖 Personagens</button>
            <button className={abaAtiva === "jogadores" ? "border-b-2 border-violet-500 text-white" : "text-zinc-400"} onClick={() => setAbaAtiva("jogadores")}>👥 Jogadores</button>
          </div>

          {/* Fichas */}
          {abaAtiva === "fichas" && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Fichas</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fichasCampanha.map((f) => (
                  <div key={f.id} className="relative p-4 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-violet-500">
                    <div onClick={() => onAbrirFicha(f.id)}>
                      <div className="text-lg font-bold">{f.dados?.profile?.nome || "Sem Nome"}</div>
                      <div className="text-sm text-zinc-400">👤 {f.dados?.profile?.jogador || "Desconhecido"}</div>
                      <div className="text-sm text-zinc-400">⚔️ {f.dados?.profile?.classe || "Sem classe"}</div>
                    </div>
                    {f.dono_id === usuarioAtual.id && (
                      <button onClick={() => setFichaConfig(f)} className="absolute top-2 right-2 text-zinc-400 hover:text-white">⚙️</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-xl mb-2">Adicionar Ficha</h3>
                <div className="flex gap-2">
                  <select value={fichaSelecionada} onChange={(e) => setFichaSelecionada(e.target.value)} className="flex-1 p-2 bg-zinc-900 border border-zinc-700 rounded-lg">
                    <option value="">Selecione</option>
                    {fichas.map((f) => (
                      <option key={f.id} value={f.id}>{f.dados?.profile?.nome || "Sem Nome"}</option>
                    ))}
                  </select>
                  <button onClick={adicionarFicha} className="px-4 py-2 bg-violet-600 rounded-lg">➕ Adicionar</button>
                </div>
              </div>
            </section>
          )}

          {/* Jogadores */}
          {abaAtiva === "jogadores" && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Jogadores</h2>
              <ul className="space-y-3">
                {membros.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 bg-zinc-900 p-3 rounded-lg border border-zinc-700">
                    <img src={m.avatar || "https://placehold.co/40x40?text=?"} alt="avatar" className="w-10 h-10 rounded-full border border-zinc-600" />
                    <div>
                      <p className="text-white font-semibold">{m.username || m.email}</p>
                      <p className="text-sm text-zinc-400">{m.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Modal de Config Ficha */}
          {fichaConfig && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Configurações da Ficha: {fichaConfig.dados?.profile?.nome}</h2>

                <label className="block mb-2">Quem pode ver?</label>
                <select value={fichaConfig.visibilidade || "todos"} onChange={(e) => salvarConfigFicha(fichaConfig.id, { visibilidade: e.target.value })} className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <option value="todos">Todos</option>
                  <option value="mestre">Somente Mestre</option>
                </select>

                <label className="block mb-2">Quem pode editar?</label>
                <select value={fichaConfig.edicao || "dono"} onChange={(e) => salvarConfigFicha(fichaConfig.id, { edicao: e.target.value })} className="w-full p-2 mb-6 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <option value="dono">Somente Dono</option>
                  <option value="mestre">Mestre</option>
                </select>

                <button onClick={() => setFichaConfig(null)} className="w-full px-4 py-2 bg-violet-600 rounded-lg">Fechar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
