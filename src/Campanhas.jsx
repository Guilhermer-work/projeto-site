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
      if (!res.ok) throw new Error("Erro ao criar campanha");
      const data = await res.json();
      setCampanhas([data, ...campanhas]);
      setNovaCampanha({ nome: "", descricao: "" });
      abrirCampanha(data);
    } catch (err) {
      alert(err.message);
    }
  }

  async function carregarFichasCampanha(campanhaId) {
    try {
      const res = await apiFetch(`/campanhas/${campanhaId}/fichas`);
      if (!res.ok) return;
      const data = await res.json();
      setFichasCampanha(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function carregarMembros(campanhaId) {
    try {
      const res = await apiFetch(`/campanhas/${campanhaId}/membros`);
      if (!res.ok) return;
      const data = await res.json();
      setMembros(data);
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
    if (!fichaSelecionada) return alert("Selecione uma ficha");
    try {
      await apiFetch(`/campanhas/${campanhaAtiva.id}/add-ficha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fichaId: Number(fichaSelecionada) }),
      });
      setFichaSelecionada("");
      carregarFichasCampanha(campanhaAtiva.id);
    } catch (err) {
      alert("Erro ao adicionar ficha");
    }
  }

  async function salvarConfigFicha(config) {
    try {
      await apiFetch(`/fichas/${config.id}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setFichaConfig(null);
      carregarFichasCampanha(campanhaAtiva.id);
    } catch (err) {
      alert("Erro ao salvar configurações");
    }
  }

  function copiarLinkConvite() {
    if (!campanhaAtiva?.codigo) return;
    const link = `${window.location.origin}/campanha/${campanhaAtiva.codigo}`;
    navigator.clipboard.writeText(link);
    alert("Link de convite copiado!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-8">
      {!campanhaAtiva ? (
        <>
          <h1 className="text-3xl font-bold mb-6">📚 Minhas Campanhas</h1>
          {campanhas.map((c) => (
            <div key={c.id} onClick={() => abrirCampanha(c)} className="p-6 rounded-xl bg-zinc-900 border border-zinc-700 cursor-pointer hover:border-violet-500">
              <h2 className="text-xl font-bold">{c.nome}</h2>
              <p className="text-zinc-400">{c.descricao}</p>
            </div>
          ))}

          <div className="mt-8 bg-zinc-900 p-6 rounded-xl border border-zinc-700 max-w-lg">
            <h2 className="text-xl font-semibold mb-4">➕ Criar Nova Campanha</h2>
            <input className="w-full p-2 mb-3 bg-zinc-800 border border-zinc-700 rounded-lg" value={novaCampanha.nome} onChange={(e) => setNovaCampanha({ ...novaCampanha, nome: e.target.value })} placeholder="Nome" />
            <textarea className="w-full p-2 mb-3 bg-zinc-800 border border-zinc-700 rounded-lg" value={novaCampanha.descricao} onChange={(e) => setNovaCampanha({ ...novaCampanha, descricao: e.target.value })} placeholder="Descrição" />
            <button onClick={criarCampanha} className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg">Criar</button>
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setCampanhaAtiva(null)} className="mb-6 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg">← Voltar</button>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">📖 {campanhaAtiva.nome}</h1>
            <button onClick={copiarLinkConvite} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg">📋 Copiar link</button>
          </div>

          <div className="flex gap-4 border-b border-zinc-700 mb-6">
            <button onClick={() => setAbaAtiva("fichas")} className={abaAtiva === "fichas" ? "border-b-2 border-violet-500 px-4 py-2" : "px-4 py-2 text-zinc-400"}>📖 Personagens</button>
            <button onClick={() => setAbaAtiva("jogadores")} className={abaAtiva === "jogadores" ? "border-b-2 border-violet-500 px-4 py-2" : "px-4 py-2 text-zinc-400"}>👥 Jogadores</button>
          </div>

          {abaAtiva === "fichas" && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Fichas</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fichasCampanha.map((f) => (
                  <div key={f.id} className="relative p-4 rounded-xl bg-zinc-900 border border-zinc-700">
                    <div onClick={() => onAbrirFicha(f.id)}>
                      <h3 className="font-bold">{f.dados?.profile?.nome || "Sem Nome"}</h3>
                      <p className="text-sm text-zinc-400">👤 {f.dados?.profile?.jogador}</p>
                    </div>
                    {(Number(f.dono_id) === Number(usuarioAtual?.id)) && (
                      <button onClick={() => setFichaConfig(f)} className="absolute top-2 right-2 text-zinc-400 hover:text-white">⚙️</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-2">
                <select value={fichaSelecionada} onChange={(e) => setFichaSelecionada(e.target.value)} className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <option value="">Selecione uma ficha</option>
                  {fichas.map((f) => <option key={f.id} value={f.id}>{f.dados?.profile?.nome}</option>)}
                </select>
                <button onClick={adicionarFicha} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg">➕</button>
              </div>
            </section>
          )}

          {abaAtiva === "jogadores" && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Jogadores</h2>
              <ul>
                {membros.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 bg-zinc-900 p-3 mb-2 rounded-lg border border-zinc-700">
                    <img src={m.avatar || "https://placehold.co/40x40?text=?"} className="w-10 h-10 rounded-full" alt="avatar" />
                    <div>
                      <p>{m.username}</p>
                      <p className="text-xs text-zinc-400">{m.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {fichaConfig && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Configurar Ficha</h2>
                <label className="block mb-2">Quem pode ver?</label>
                <select value={fichaConfig.visibilidade || "todos"} onChange={(e) => setFichaConfig({ ...fichaConfig, visibilidade: e.target.value })} className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <option value="todos">Todos</option>
                  <option value="mestre">Somente Mestre</option>
                </select>

                <label className="block mb-2">Quem pode editar?</label>
                <select value={fichaConfig.edicao || "dono"} onChange={(e) => setFichaConfig({ ...fichaConfig, edicao: e.target.value })} className="w-full p-2 mb-6 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <option value="dono">Somente Dono</option>
                  <option value="mestre">Mestre</option>
                </select>

                <div className="flex gap-2">
                  <button onClick={() => salvarConfigFicha(fichaConfig)} className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg">Salvar</button>
                  <button onClick={() => setFichaConfig(null)} className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg">Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
