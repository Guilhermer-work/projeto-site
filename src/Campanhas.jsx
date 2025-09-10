import React, { useState, useEffect } from "react";

export default function Campanhas({ apiFetch, fichas, onAbrirFicha }) {
  const [campanhas, setCampanhas] = useState([]);
  const [novaCampanha, setNovaCampanha] = useState({ nome: "", descricao: "" });
  const [campanhaAtiva, setCampanhaAtiva] = useState(null);
  const [fichasCampanha, setFichasCampanha] = useState([]);
  const [fichaSelecionada, setFichaSelecionada] = useState("");
  const [convidarEmail, setConvidarEmail] = useState("");
  const [convidados, setConvidados] = useState([]);
  const [config, setConfig] = useState({ visibilidade_fichas: "todos", edicao_fichas: "criador" });

  useEffect(() => {
    carregarCampanhas();
  }, []);

  const carregarCampanhas = async () => {
    try {
      const res = await apiFetch("/campanhas");
      const data = await res.json();
      setCampanhas(data);
    } catch (err) {
      console.error("Erro ao carregar campanhas", err);
    }
  };

  const criarCampanha = async () => {
    if (!novaCampanha.nome.trim()) return alert("Digite um nome para a campanha");
    try {
      const res = await apiFetch("/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novaCampanha.nome.trim(),
          descricao: novaCampanha.descricao || "",
        }),
      });
      const data = await res.json();
      setCampanhas([...campanhas, data]);
      setNovaCampanha({ nome: "", descricao: "" });
    } catch (e) {
      alert(e.message);
    }
  };

  const carregarFichasCampanha = async (campanhaId) => {
    try {
      const res = await apiFetch(`/campanhas/${campanhaId}/fichas`);
      const data = await res.json();
      setFichasCampanha(data);
    } catch {
      alert("Erro ao carregar fichas da campanha");
    }
  };

  const carregarConvidados = async (campanhaId) => {
    try {
      const res = await apiFetch(`/campanhas/${campanhaId}/convidados`);
      const data = await res.json();
      setConvidados(data);
    } catch {
      alert("Erro ao carregar convidados");
    }
  };

  const abrirCampanha = async (campanha) => {
    setCampanhaAtiva(campanha);
    setConfig({
      visibilidade_fichas: campanha.visibilidade_fichas || "todos",
      edicao_fichas: campanha.edicao_fichas || "criador",
    });
    carregarFichasCampanha(campanha.id);
    carregarConvidados(campanha.id);
  };

  const adicionarFicha = async () => {
    if (!fichaSelecionada) return alert("Selecione uma ficha");
    try {
      await apiFetch(`/campanhas/${campanhaAtiva.id}/add-ficha`, {
        method: "POST",
        body: JSON.stringify({ fichaId: Number(fichaSelecionada) })
      });
      setFichaSelecionada("");
      carregarFichasCampanha(campanhaAtiva.id);
    } catch {
      alert("Erro ao adicionar ficha na campanha");
    }
  };

  const convidarUsuario = async () => {
    if (!convidarEmail.trim()) return;
    try {
      await apiFetch(`/campanhas/${campanhaAtiva.id}/convidar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: convidarEmail.trim() }),
      });
      setConvidarEmail("");
      carregarConvidados(campanhaAtiva.id);
    } catch {
      alert("Erro ao convidar");
    }
  };

  const salvarConfiguracoes = async () => {
    try {
      await apiFetch(`/campanhas/${campanhaAtiva.id}/configuracoes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      alert("Configurações salvas!");
    } catch {
      alert("Erro ao salvar configurações");
    }
  };

  if (campanhaAtiva) {
    const linkConvite = `https://pressagios.onrender.com/campanha/${campanhaAtiva.codigo}`;

    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-8">
        <button
          onClick={() => setCampanhaAtiva(null)}
          className="mb-6 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
        >
          ← Voltar para lista de campanhas
        </button>

        <h1 className="text-3xl font-bold mb-4">📖 {campanhaAtiva.nome}</h1>
        <p className="text-zinc-400 mb-6">{campanhaAtiva.descricao}</p>

        <div className="mb-8">
          <label className="block text-sm text-zinc-400 mb-1">🔗 Link de convite:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={linkConvite}
              readOnly
              className="flex-1 p-2 bg-zinc-800 border border-zinc-600 rounded-lg text-sm text-white"
            />
            <button
              onClick={() => navigator.clipboard.writeText(linkConvite)}
              className="px-3 py-2 text-sm bg-violet-600 hover:bg-violet-500 rounded-lg"
            >
              Copiar
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Fichas da Campanha</h2>
            {fichasCampanha.map((f) => (
              <div
                key={f.id}
                onClick={() => onAbrirFicha(f.id)}
                className="cursor-pointer p-4 rounded-xl bg-zinc-800 border border-zinc-600 mb-2"
              >
                <strong>{f.dados?.profile?.nome || "Sem nome"}</strong> — 👤 {f.dados?.profile?.jogador || "Desconhecido"}
              </div>
            ))}

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">➕ Adicionar Ficha</h3>
              <div className="flex gap-2">
                <select
                  value={fichaSelecionada}
                  onChange={(e) => setFichaSelecionada(e.target.value)}
                  className="flex-1 p-2 bg-zinc-800 border border-zinc-600 rounded-lg"
                >
                  <option value="">Selecione uma ficha</option>
                  {fichas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.dados?.profile?.nome || "Sem nome"}
                    </option>
                  ))}
                </select>
                <button
                  onClick={adicionarFicha}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">⚙️ Configurações da Campanha</h2>

            <label className="block mb-2 text-sm">Quem pode ver fichas:</label>
            <select
              value={config.visibilidade_fichas}
              onChange={(e) => setConfig({ ...config, visibilidade_fichas: e.target.value })}
              className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-600 rounded-lg"
            >
              <option value="todos">Todos os jogadores</option>
              <option value="mestre">Apenas o mestre</option>
            </select>

            <label className="block mb-2 text-sm">Quem pode editar fichas:</label>
            <select
              value={config.edicao_fichas}
              onChange={(e) => setConfig({ ...config, edicao_fichas: e.target.value })}
              className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-600 rounded-lg"
            >
              <option value="criador">Somente quem criou</option>
              <option value="mestre">Mestre pode editar tudo</option>
            </select>

            <button
              onClick={salvarConfiguracoes}
              className="w-full mb-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg"
            >
              Salvar Configurações
            </button>

            <h2 className="text-2xl font-semibold mb-2">🙋 Jogadores Convidados</h2>
            {convidados.map((u) => (
              <div key={u.id} className="text-sm text-zinc-300">
                • {u.username || u.email}
              </div>
            ))}

            <div className="mt-4">
              <input
                type="email"
                placeholder="Email do jogador"
                value={convidarEmail}
                onChange={(e) => setConvidarEmail(e.target.value)}
                className="w-full p-2 mb-2 bg-zinc-800 border border-zinc-600 rounded-lg"
              />
              <button
                onClick={convidarUsuario}
                className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
              >
                Convidar jogador
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">📚 Minhas Campanhas</h1>

      {campanhas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {campanhas.map((c) => (
            <div
              key={c.id}
              onClick={() => abrirCampanha(c)}
              className="cursor-pointer p-6 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all"
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
        <button
          onClick={criarCampanha}
          className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
        >
          Criar Campanha
        </button>
      </div>
    </div>
  );
}
