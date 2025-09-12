import React, { useState, useEffect } from "react";

export default function Campanhas({ apiFetch, fichas, onAbrirFicha, user }) {
  const [campanhas, setCampanhas] = useState([]);
  const [novaCampanha, setNovaCampanha] = useState({ nome: "", descricao: "" });
  const [campanhaAtiva, setCampanhaAtiva] = useState(null);
  const [fichasCampanha, setFichasCampanha] = useState([]);
  const [fichaSelecionada, setFichaSelecionada] = useState("");
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("fichas");
  const [membros, setMembros] = useState([]);
  const [campanhaParaDeletar, setCampanhaParaDeletar] = useState(null);
  const [jogadorParaRemover, setJogadorParaRemover] = useState(null);
  const [fichaParaRemover, setFichaParaRemover] = useState(null);

  useEffect(() => {
    carregarCampanhas();
  }, []);

  async function carregarCampanhas() {
    try {
      const res = await apiFetch("/campanhas");
      if (!res.ok) return;
      const data = await res.json();
      setCampanhas(data);
    } catch {}
  }

  async function criarCampanha() {
    const nome = (novaCampanha.nome || "").trim();
    if (!nome) return alert("Digite um nome para a campanha");

    try {
      const res = await apiFetch("/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, descricao: novaCampanha.descricao || "" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao criar campanha");
      }

      const created = await res.json();
      setCampanhas((s) => [created, ...s]);
      setNovaCampanha({ nome: "", descricao: "" });
      abrirCampanha(created);
    } catch (e) {
      alert(e.message || "Erro desconhecido");
    }
  }

  async function deletarCampanha(id) {
    try {
      await apiFetch(`/campanhas/${id}`, { method: "DELETE" });
      setCampanhas((prev) => prev.filter((c) => c.id !== id));
      if (campanhaAtiva?.id === id) setCampanhaAtiva(null);
    } catch {
      alert("Erro ao deletar campanha");
    }
  }

  async function carregarFichasCampanha(campanhaId) {
    try {
      const res = await apiFetch(`/campanhas/${campanhaId}/fichas`);
      if (!res.ok) throw new Error(`Erro ao obter fichas (${res.status})`);
      const data = await res.json().catch(() => []);
      setFichasCampanha(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar fichas da campanha:", err);
      setFichasCampanha([]);
    }
  }

  async function carregarMembros(campanhaId) {
    try {
      const res = await apiFetch(`/campanhas/${campanhaId}/membros`);
      if (!res.ok) throw new Error(`Erro ao obter membros (${res.status})`);
      const data = await res.json().catch(() => []);
      setMembros(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar membros:", err);
      setMembros([]);
    }
  }

  function abrirCampanha(campanha) {
    if (!campanha?.id) {
      alert("Erro ao abrir campanha");
      return;
    }
    setCampanhaAtiva(campanha);
    setAbaAtiva("fichas");
    carregarFichasCampanha(campanha.id).catch(() => alert("Erro ao carregar fichas"));
    carregarMembros(campanha.id).catch(() => alert("Erro ao carregar membros"));
  }

  async function adicionarFicha() {
    if (!fichaSelecionada) return alert("Selecione uma ficha");
    if (!campanhaAtiva) return alert("Abra uma campanha antes de adicionar ficha");

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

  async function removerFichaDaCampanha(fichaId) {
    try {
      await apiFetch(`/campanhas/${campanhaAtiva.id}/fichas/${fichaId}`, { method: "DELETE" });
      carregarFichasCampanha(campanhaAtiva.id);
    } catch {
      alert("Erro ao remover ficha");
    }
  }

  function copiarLinkConvite() {
    if (!campanhaAtiva || !campanhaAtiva.codigo) return alert("Esta campanha não tem código de convite");
    const link = `${window.location.origin}/campanha/${campanhaAtiva.codigo}`;
    navigator.clipboard
      .writeText(link)
      .then(() => alert("Link de convite copiado!"))
      .catch(() => alert("Falha ao copiar link"));
  }

  async function sairCampanha() {
    if (!campanhaAtiva) return;
    try {
      await apiFetch(`/campanhas/${campanhaAtiva.id}/sair`, { method: "POST" });
      setCampanhaAtiva(null);
      carregarCampanhas();
    } catch {
      alert("Erro ao sair da campanha");
    }
  }

  async function removerJogador(userId) {
    try {
      await apiFetch(`/campanhas/${campanhaAtiva.id}/remover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      carregarMembros(campanhaAtiva.id);
    } catch {
      alert("Erro ao remover jogador");
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
                <CampanhaCard
                  key={c.id}
                  campanha={c}
                  onClick={() => abrirCampanha(c)}
                  onDelete={() => setCampanhaParaDeletar(c.id)}
                />
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
            <button
              onClick={criarCampanha}
              className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
            >
              Criar Campanha
            </button>
          </div>
        </>
      ) : (
        <div>
          <button
            onClick={() => setCampanhaAtiva(null)}
            className="mb-6 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
          >
            ← Voltar para lista de campanhas
          </button>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">📖 {campanhaAtiva.nome}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={copiarLinkConvite}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
              >
                📋 Copiar link
              </button>

              {campanhaAtiva.user_id === user.id ? (
                <button
                  onClick={() => setCampanhaParaDeletar(campanhaAtiva.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg ml-2"
                >
                  🗑️ Deletar
                </button>
              ) : (
                <button
                  onClick={() => setConfirmarSaida(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg ml-2"
                >
                  🚪 Sair
                </button>
              )}
            </div>
          </div>

          {campanhaParaDeletar && (
            <ConfirmDeleteCampanha
              onCancel={() => setCampanhaParaDeletar(null)}
              onConfirm={() => {
                deletarCampanha(campanhaParaDeletar);
                setCampanhaParaDeletar(null);
              }}
            />
          )}

          {confirmarSaida && (
            <ConfirmExitCampaign
              onCancel={() => setConfirmarSaida(false)}
              onConfirm={() => {
                sairCampanha();
                setConfirmarSaida(false);
              }}
            />
          )}

          <p className="text-zinc-400 mb-4">{campanhaAtiva.descricao}</p>

          {/* Abas */}
          <div className="flex gap-4 border-b border-zinc-700 mb-6">
            <button
              className={abaAtiva === "fichas" ? "px-4 py-2 border-b-2 border-violet-500 text-white" : "px-4 py-2 text-zinc-400"}
              onClick={() => setAbaAtiva("fichas")}
            >
              📖 Personagens
            </button>
            <button
              className={abaAtiva === "jogadores" ? "px-4 py-2 border-b-2 border-violet-500 text-white" : "px-4 py-2 text-zinc-400"}
              onClick={() => setAbaAtiva("jogadores")}
            >
              👥 Jogadores
            </button>
          </div>

          {/* Aba Fichas */}
          {abaAtiva === "fichas" && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Fichas da Campanha</h2>

              {fichasCampanha.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {fichasCampanha.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => onAbrirFicha(f.id)}
                      className="cursor-pointer relative p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                    >
                      {(campanhaAtiva.user_id === user.id || f.user_id === user.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFichaParaRemover(f);
                          }}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                          title="Remover Ficha"
                        >
                          ❌
                        </button>
                      )}

                      <div className="text-lg font-bold mb-2">{f.dados?.profile?.nome || "Sem Nome"}</div>
                      <div className="text-sm text-zinc-400">👤 {f.dados?.profile?.jogador || "Desconhecido"}</div>
                      <div className="text-sm text-zinc-400">⚔️ {f.dados?.profile?.classe || "Sem classe"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 italic">Nenhuma ficha adicionada ainda...</p>
              )}

              {fichaParaRemover && (
                <ConfirmRemoveFicha
                  ficha={fichaParaRemover}
                  onCancel={() => setFichaParaRemover(null)}
                  onConfirm={() => {
                    removerFichaDaCampanha(fichaParaRemover.id);
                    setFichaParaRemover(null);
                  }}
                />
              )}

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-2">Adicionar Ficha</h3>
                <div className="flex gap-2">
                  <select
                    value={fichaSelecionada}
                    onChange={(e) => setFichaSelecionada(e.target.value)}
                    className="flex-1 p-2 bg-zinc-900 border border-zinc-700 rounded-lg"
                  >
                    <option value="">Selecione uma ficha</option>
                    {fichas.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.dados?.profile?.nome || "Sem Nome"}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={adicionarFicha}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
                  >
                    ➕ Adicionar
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Aba Jogadores */}
          {abaAtiva === "jogadores" && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Jogadores</h2>

              {membros.length > 0 ? (
                <ul className="space-y-3">
                  {membros.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 bg-zinc-900 p-3 rounded-lg border border-zinc-700"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar || "https://placehold.co/40x40?text=?"}
                          alt="avatar"
                          className="w-10 h-10 rounded-full border border-zinc-600"
                        />
                        <div>
                          <p className="text-white font-semibold">{m.username || m.email}</p>
                          <p className="text-sm text-zinc-400">{m.email}</p>
                        </div>
                      </div>

                      {campanhaAtiva.user_id === user.id && m.id !== user.id && (
                        <button
                          onClick={() => setJogadorParaRemover(m)}
                          className="text-zinc-400 hover:text-red-400"
                          title="Remover jogador"
                        >
                          ⚙️
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500 italic">Nenhum jogador entrou ainda...</p>
              )}
            </section>
          )}

          {jogadorParaRemover && (
            <ConfirmRemoveJogador
              jogador={jogadorParaRemover}
              onCancel={() => setJogadorParaRemover(null)}
              onConfirm={() => {
                removerJogador(jogadorParaRemover.id);
                setJogadorParaRemover(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CampanhaCard({ campanha, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all group"
    >
      <div className="text-xl font-bold mb-2">{campanha.nome}</div>
      <div className="text-sm text-zinc-400">{campanha.descricao || "Sem descrição"}</div>
    </div>
  );
}

function ConfirmDeleteCampanha({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Excluir Campanha</h2>
        <p className="text-zinc-300 mb-6">
          Tem certeza que deseja excluir esta campanha? Essa ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmExitCampaign({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold text-orange-400 mb-4">⚠️ Sair da Campanha</h2>
        <p className="text-zinc-300 mb-6">
          Tem certeza que deseja sair desta campanha? Você poderá voltar com o link de convite.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmRemoveJogador({ jogador, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Remover Jogador</h2>
        <p className="text-zinc-300 mb-6">
          Tem certeza que deseja remover{" "}
          <span className="font-semibold text-white">{jogador.username || jogador.email}</span> da
          campanha?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmRemoveFicha({ ficha, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Remover Ficha</h2>
        <p className="text-zinc-300 mb-6">
          Tem certeza que deseja remover a ficha{" "}
          <span className="font-semibold text-white">{ficha.dados?.profile?.nome || "Sem Nome"}</span>{" "}
          da campanha?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}
