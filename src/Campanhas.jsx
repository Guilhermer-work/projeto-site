import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Campanhas({ apiFetch, fichas, onAbrirFicha }) {
  const [campanhas, setCampanhas] = useState([]);
  const [novaCampanha, setNovaCampanha] = useState({ nome: "", descricao: "" });
  const [campanhaAtiva, setCampanhaAtiva] = useState(null);
  const [fichasCampanha, setFichasCampanha] = useState([]);
  const [fichaSelecionada, setFichaSelecionada] = useState("");
  const [usuariosCampanha, setUsuariosCampanha] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    carregarCampanhas();
  }, []);

  async function carregarCampanhas() {
    try {
      const res = await apiFetch("/campanhas");
      if (!res.ok) throw new Error("Erro ao buscar campanhas");
      const data = await res.json();
      setCampanhas(data);
    } catch (err) {
      console.error("Erro ao carregar campanhas", err);
    }
  }

  async function criarCampanha() {
    if (!novaCampanha.nome || !novaCampanha.nome.trim()) {
      return alert("Digite um nome para a campanha");
    }
    try {
      const res = await apiFetch("/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novaCampanha.nome.trim(), descricao: novaCampanha.descricao || "" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao criar campanha");
      }
      const created = await res.json();
      setCampanhas((s) => [created, ...s]);
      setNovaCampanha({ nome: "", descricao: "" });
      setCampanhaAtiva(created);
      // carrega detalhes da nova campanha
      carregarFichasCampanha(created.id);
      carregarUsuariosCampanha(created.id);
    } catch (err) {
      alert(err.message || "Erro desconhecido");
    }
  }

  async function carregarFichasCampanha(campanhaId) {
    try {
      const res = await apiFetch(`/campanhas/${campanhaId}/fichas`);
      if (!res.ok) throw new Error("Erro ao carregar fichas");
      const data = await res.json();
      setFichasCampanha(data);
    } catch (err) {
      console.error(err);
      setFichasCampanha([]);
    }
  }

  async function carregarUsuariosCampanha(campanhaId) {
    try {
      const res = await apiFetch(`/campanhas/${campanhaId}/membros`);
      if (!res.ok) throw new Error("Erro ao carregar membros");
      const data = await res.json();
      setUsuariosCampanha(data);
    } catch (err) {
      console.error("Erro ao carregar usuários da campanha", err);
      setUsuariosCampanha([]);
    }
  }

  function abrirCampanha(campanha) {
    setCampanhaAtiva(campanha);
    carregarFichasCampanha(campanha.id);
    carregarUsuariosCampanha(campanha.id);
  }

  async function adicionarFicha() {
    if (!fichaSelecionada) return alert("Selecione uma ficha");
    try {
      const res = await apiFetch(`/campanhas/${campanhaAtiva.id}/add-ficha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fichaId: Number(fichaSelecionada) }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao adicionar ficha");
      }
      setFichaSelecionada("");
      carregarFichasCampanha(campanhaAtiva.id);
    } catch (err) {
      alert(err.message || "Erro ao adicionar ficha na campanha");
    }
  }

  function copiarLinkConvite() {
    if (!campanhaAtiva?.codigo) return alert("Esta campanha não tem código de convite");
    const link = `${window.location.origin}/campanha/${campanhaAtiva.codigo}`;
    navigator.clipboard.writeText(link).then(() => alert("Link de convite copiado!"), () => alert("Falha ao copiar link"));
  }

  async function entrarCampanha() {
    try {
      const res = await apiFetch(`/campanhas/${campanhaAtiva.id}/entrar`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao entrar na campanha");
      }
      // recarrega membros
      carregarUsuariosCampanha(campanhaAtiva.id);
      alert("Você entrou na campanha!");
    } catch (err) {
      alert(err.message || "Erro ao entrar na campanha");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-8">
      {!campanhaAtiva ? (
        <>
          <h1 className="text-3xl font-bold mb-6">📚 Minhas Campanhas</h1>

          {campanhas.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
              {campanhas.map((c) => (
                <div
                  key={c.id}
                  onClick={() => abrirCampanha(c)}
                  className="cursor-pointer p-6 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                >
                  <div className="text-xl font-bold mb-2">{c.nome}</div>
                  <div className="text-sm text-zinc-400">{c.descricao || "Sem descrição"}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 italic mb-10">Nenhuma campanha criada ainda...</p>
          )}

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 max-w-lg">
            <h2 className="text-xl font-semibold mb-4">➕ Criar Nova Campanha</h2>
            <input
              type="text"
              placeholder="Nome da campanha"
              value={novaCampanha.nome}
              onChange={(e) => setNovaCampanha({ ...novaCampanha, nome: e.target.value })}
              className="w-full p-2 mb-3 bg-zinc-800 border border-zinc-700 rounded-lg"
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={novaCampanha.descricao}
              onChange={(e) => setNovaCampanha({ ...novaCampanha, descricao: e.target.value })}
              className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-700 rounded-lg"
            />
            <button onClick={criarCampanha} className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg">
              Criar Campanha
            </button>
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setCampanhaAtiva(null)} className="mb-6 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg">← Voltar para lista de campanhas</button>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">📖 {campanhaAtiva.nome}</h1>
            <div className="flex items-center gap-2">
              <button onClick={copiarLinkConvite} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg">📋 Copiar link</button>
              <button onClick={entrarCampanha} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg">➕ Entrar</button>
            </div>
          </div>

          <p className="text-zinc-400 mb-4">{campanhaAtiva.descricao}</p>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">👑 Mestre da campanha</h2>
            <div className="flex items-center gap-3">
              <img src={campanhaAtiva.mestre_avatar || "https://placehold.co/48x48"} alt="avatar" className="w-12 h-12 rounded-full border" />
              <div>
                <div className="font-semibold">{campanhaAtiva.mestre_nome || campanhaAtiva.user_email || "Mestre"}</div>
                <div className="text-xs text-zinc-400">{campanhaAtiva.user_email || ""}</div>
              </div>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">👥 Membros</h2>
            {usuariosCampanha.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {usuariosCampanha.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-700">
                    <img src={u.avatar || "https://placehold.co/40x40"} alt={u.username} className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="font-semibold">{u.username || u.email}</div>
                      <div className="text-xs text-zinc-400">{u.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 italic">Nenhum usuário entrou ainda...</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">📜 Fichas da campanha</h2>
            {fichasCampanha.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fichasCampanha.map((f) => (
                  <div key={f.id} onClick={() => onAbrirFicha(f.id)} className="cursor-pointer p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all">
                    <div className="text-lg font-bold mb-2">{f.dados?.profile?.nome || "Sem Nome"}</div>
                    <div className="text-sm text-zinc-400">👤 {f.dados?.profile?.jogador || "Desconhecido"}</div>
                    <div className="text-sm text-zinc-400">⚔️ {f.dados?.profile?.classe || "Sem classe"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 italic">Nenhuma ficha adicionada ainda...</p>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Adicionar ficha</h3>
              <div className="flex gap-2">
                <select value={fichaSelecionada} onChange={(e) => setFichaSelecionada(e.target.value)} className="flex-1 p-2 bg-zinc-900 border border-zinc-700 rounded-lg">
                  <option value="">Selecione uma ficha</option>
                  {fichas.map((f) => (
                    <option key={f.id} value={f.id}>{f.dados?.profile?.nome || "Sem Nome"}</option>
                  ))}
                </select>
                <button onClick={adicionarFicha} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg">➕ Adicionar</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
