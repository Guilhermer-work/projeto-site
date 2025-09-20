import React, { useState, useEffect } from "react";
import CRISSheet from "./CRISSheet";
import Header from "./Header";
import Campanhas from "./Campanhas";
import Perfil from "./Perfil";
import LoginPage from "./LoginPage";
import CampanhaConvite from "./CampanhaConvite";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(true);
  const [fichas, setFichas] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [fichaParaDeletar, setFichaParaDeletar] = useState(null);
  const [user, setUser] = useState(null);
  const [somenteVisualizar, setSomenteVisualizar] = useState(false);
  const [fichaVisualizada, setFichaVisualizada] = useState(null);

  // função para abrir ficha (use essa função no Route /campanhas como onAbrirFicha={abrirFicha})
const abrirFicha = (id, fichaDireta = null, somenteVisualizarFlag = false, isMestre = false) => {
  // garante activeId e flag primeiro
  setActiveId(id);
  setSomenteVisualizar(!!somenteVisualizarFlag);

  if (!fichaDireta) {
    // não veio com dados diretos da campanha, vamos depender do que já temos em `fichas`
    setFichaVisualizada(null);
    return;
  }

  // normaliza objeto da ficha (garante id/nome/dados corretos)
  const fichaObj = {
    id: fichaDireta.id,
    nome: fichaDireta.nome,
    dados: fichaDireta.dados ?? fichaDireta.dados, // caso já seja objeto ou string
    user_id: fichaDireta.user_id,
    // ... qualquer outro campo que precise
  };

  // Caso 1: somenteVisualizar (outros jogadores que não são dono nem mestre) -> apenas mostra leitura
  if (somenteVisualizarFlag) {
    setFichaVisualizada(fichaObj);
    setSomenteVisualizar(true);
    return;
  }

  // Caso 2: edição (não somenteVisualizar)
  // - se for dono da ficha -> garantir que esteja no acervo (fichas) e abrir para edição
  if (fichaObj.user_id === user.id) {
    setFichaVisualizada(null); // limpa qualquer visualização temporária
    setSomenteVisualizar(false);

    setFichas((prev) => {
      // se já existe, não adiciona (evita duplicação)
      if (prev.some((fx) => fx.id === fichaObj.id)) return prev;
      return [...prev, { id: fichaObj.id, nome: fichaObj.nome, dados: fichaObj.dados }];
    });

    return;
  }

  // Caso 3: não é dono (provavelmente mestre)
  // Mestre deve poder **abrir/editar** mas **NÃO** duplicar a ficha em seu acervo
  if (isMestre) {
    setFichaVisualizada(fichaObj);
    setSomenteVisualizar(false); // permite edição no CRISheet quando implementado (CRISSheet deve usar somenteVisualizar para bloquear)
    return;
  }

  // Fallback: se não se encaixa, apenas guarda como visualização
  setFichaVisualizada(fichaObj);
  setSomenteVisualizar(true);
};



  const API = "https://pressagios-login.onrender.com";

  async function refreshAccessToken() {
    try {
      const res = await fetch(`${API}/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    }
  }

  async function apiFetch(url, options = {}) {
    let token = localStorage.getItem("token");
    let res;
    try {
      res = await fetch(`${API}${url}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Erro de rede:", err);
      throw new Error("Falha de conexão com o servidor");
    }

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        setIsLoggedIn(false);
        setFichas([]);
        setUser(null);
        localStorage.removeItem("token");
        throw new Error("Sessão expirada");
      }
      res = await fetch(`${API}${url}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    }

    return res;
  }

  // Verifica se já tinha token salvo ao iniciar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    setLoadingLogin(false);
  }, []);

  // Sempre que logar, carrega user + fichas
  useEffect(() => {
    if (isLoggedIn) {
      carregarFichas();
      carregarUser();
    }
  }, [isLoggedIn]);

  const carregarUser = async () => {
    try {
      const res = await apiFetch("/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Erro ao carregar usuário", err);
    }
  };

  const carregarFichas = async () => {
    try {
      const res = await apiFetch("/fichas");
      const data = await res.json();
      if (Array.isArray(data)) {
        setFichas(data);
      }
    } catch (err) {
      console.error("Erro ao carregar fichas", err);
    }
  };

  const criarFicha = async () => {
    const nova = {
      nome: "Novo Personagem",
      dados: {
        profile: { nome: "", origem: "", jogador: "", classe: "" },
        attrs: { FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 },
        hp: { atual: 10, max: 10 },
        san: { atual: 10, max: 10 },
        esf: { atual: 10, max: 10 },
        ataques: [],
      },
    };
    try {
      const res = await apiFetch("/fichas", {
        method: "POST",
        body: JSON.stringify(nova),
      });
      const data = await res.json();
      setFichas([...fichas, { id: data.id, nome: nova.nome, ...nova }]);
      return data.id;
    } catch {
      alert("Erro ao criar ficha");
      return null;
    }
  };

  const atualizarFicha = async (id, novosDados) => {
    const fichaAtual = fichas.find((f) => f.id === id);
    const mergeDeep = (target, source) => {
      const output = { ...target };
      for (const key of Object.keys(source)) {
        if (
          source[key] instanceof Object &&
          key in target &&
          target[key] instanceof Object
        ) {
          output[key] = mergeDeep(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      }
      return output;
    };

    const fichaFinal = mergeDeep(fichaAtual.dados, novosDados);
    try {
      await apiFetch(`/fichas/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: fichaFinal.profile?.nome || "Sem nome",
          dados: fichaFinal,
        }),
      });
      setFichas((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, nome: fichaFinal.profile?.nome, dados: fichaFinal } : f
        )
      );
    } catch (err) {
      alert("Erro ao atualizar ficha");
    }
  };

  const deletarFicha = async (id) => {
    try {
      await apiFetch(`/fichas/${id}`, { method: "DELETE" });
      setFichas((prev) => prev.filter((f) => f.id !== id));
    } catch {
      alert("Erro ao deletar ficha");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setFichas([]);
    setUser(null);
  };

  if (loadingLogin) return null;

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={(dados) => {
          setIsLoggedIn(true);
          setUser(dados.user);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <Header />
      <div className="flex justify-end p-2">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Sair
        </button>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/personagens" />} />

        <Route
          path="/personagens"
          element={
            activeId ? (
              <CRISSheet
                ficha={
                  somenteVisualizar
                    ? fichaVisualizada?.dados
                    : fichas.find((f) => f.id === activeId)?.dados
                }
                onUpdate={(novosDados) => 
                  !somenteVisualizar && atualizarFicha(activeId, novosDados)
                }
                onVoltar={() => {
                  setActiveId(null);
                  setFichaVisualizada(null);
                }}
                somenteVisualizar={somenteVisualizar}
              />
            ) : (
              <div className="p-8">
                <h1 className="text-3xl font-extrabold tracking-wide text-center mb-10">
                  🎭 Personagens Registrados
                </h1>
                {fichas.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {fichas.map((f) => (
                      <FichaCard
                        key={f.id}
                        ficha={f}
                        onClick={() => {
                          setActiveId(f.id)
                          setSomenteVisualizar(false);
                        }}
                        onDelete={() => setFichaParaDeletar(f.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-zinc-500 italic">
                    Nenhuma ficha criada ainda...
                  </p>
                )}

                {fichaParaDeletar && (
                  <ConfirmDeleteFicha
                    onCancel={() => setFichaParaDeletar(null)}
                    onConfirm={() => {
                      deletarFicha(fichaParaDeletar);
                      setFichaParaDeletar(null);
                    }}
                  />
                )}

                <div className="flex justify-center">
                  <button
                    onClick={async () => {
                      const id = await criarFicha();
                      if (id) setActiveId(id);
                    }}
                    className="mt-10 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md hover:shadow-violet-500/30 transition-all"
                  >
                    ➕ Criar nova ficha
                  </button>
                </div>
              </div>
            )
          }
        />

        <Route
          path="/campanhas"
          element={
            <Campanhas
              apiFetch={apiFetch}
              fichas={fichas}
              user={user}
              onAbrirFicha={abrirFicha}
            />
          }
        />
        <Route path="/perfil" element={<Perfil apiFetch={apiFetch} />} />
        <Route
          path="/campanha/:codigo"
          element={<CampanhaConvite apiFetch={apiFetch} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

function FichaCard({ ficha, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all group"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 text-red-400 hover:text-red-600"
        title="Deletar Ficha"
      >
        ❌
      </button>
      <div className="absolute top-0 left-0 h-full w-1 bg-violet-600 rounded-l-2xl" />
      <div className="text-2xl font-bold text-white mb-1 group-hover:text-violet-300">
        {ficha.dados?.profile?.nome || "Personagem Sem Nome"}
      </div>
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
        👤 {ficha.dados?.profile?.jogador || "Jogador Desconhecido"}
      </div>
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        📖 {ficha.dados?.profile?.origem || "Sem origem"}
      </div>
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
        ⚔️ {ficha.dados?.profile?.classe || "Sem classe"}
      </div>
      <div className="flex gap-2 text-xs font-medium">
        <span className="px-2 py-1 bg-red-600/40 rounded-md text-red-300">
          HP {ficha.dados?.hp?.atual}/{ficha.dados?.hp?.max}
        </span>
        <span className="px-2 py-1 bg-purple-600/40 rounded-md text-purple-300">
          SAN {ficha.dados?.san?.atual}/{ficha.dados?.san?.max}
        </span>
        <span className="px-2 py-1 bg-orange-600/40 rounded-md text-orange-300">
          ESF {ficha.dados?.esf?.atual}/{ficha.dados?.esf?.max}
        </span>
      </div>
    </div>
  );
}

function ConfirmDeleteFicha({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Excluir Ficha</h2>
        <p className="text-zinc-300 mb-6">
          Tem certeza que deseja excluir esta ficha? Essa ação não pode ser
          desfeita.
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
