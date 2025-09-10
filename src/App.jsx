import React, { useState, useEffect } from "react";
import CRISSheet from "./CRISSheet";
import Header from "./Header";
import Campanhas from "./Campanhas";
import Perfil from "./Perfil";
import LoginPage from "./LoginPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CampanhaConvite from "./CampanhaConvite"; // vamos criar esse


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(true);
  const [fichas, setFichas] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState("personagens");
  const [fichaParaDeletar, setFichaParaDeletar] = useState(null);

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
    let res = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        setIsLoggedIn(false);
        setFichas([]);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      carregarFichas();
    }
    setLoadingLogin(false);
  }, []);

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
      setActiveId(data.id);
    } catch {
      alert("Erro ao criar ficha");
    }
  };

  const atualizarFicha = async (id, novosDados) => {
    const fichaAtual = fichas.find((f) => f.id === id);
    const fichaFinal = {
      ...fichaAtual.dados,
      ...novosDados,
    };
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
      if (activeId === id) setActiveId(null);
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
  };

  const handleNavigate = (dest) => {
    if (dest === "personagens") setView("personagens");
    if (dest === "campanhas") setView("campanhas");
    if (dest === "perfil") setView("perfil");
  };

  if (loadingLogin) return null;

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => {
      setIsLoggedIn(true);
      carregarFichas();
    }} />;
  }

  if (activeId && view === "personagens") {
    const ficha = fichas.find((f) => f.id === activeId);
    const dados = ficha?.dados || ficha;
    return (
      <>
        <Header onNavigate={handleNavigate} />
        <div className="flex justify-end p-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Sair
          </button>
        </div>
        <CRISSheet
          ficha={dados}
          onUpdate={(novosDados) => atualizarFicha(activeId, novosDados)}
          onVoltar={() => setActiveId(null)}
        />
      </>
    );
  }

  if (view === "campanhas") {
    return (
      <>
        <Header onNavigate={handleNavigate} />
        <div className="flex justify-end p-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Sair
          </button>
        </div>
        <Campanhas apiFetch={apiFetch} fichas={fichas} onAbrirFicha={setActiveId} />
      </>
    );
  }

  if (view === "perfil") {
    return (
      <>
        <Header onNavigate={handleNavigate} />
        <div className="flex justify-end p-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Sair
          </button>
        </div>
        <Perfil apiFetch={apiFetch} />
      </>
    );
  }

  return (
    <BrowserRouter>
      {!isLoggedIn ? (
        <LoginPage
          onLogin={() => {
            setIsLoggedIn(true);
            carregarFichas();
          }}
        />
      ) : (
        <>
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
            <Route
              path="/"
              element={
                activeId ? (
                  <CRISSheet
                    ficha={fichas.find((f) => f.id === activeId)?.dados}
                    onUpdate={(novosDados) => atualizarFicha(activeId, novosDados)}
                    onVoltar={() => setActiveId(null)}
                  />
                ) : (
                  <div className="p-8">
                    <h1 className="text-3xl font-extrabold tracking-wide text-center mb-10">
                      🎭 Personagens Registrados
                    </h1>
                    {fichas.length > 0 ? (
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {fichas.map((f) => (
                          <div
                            key={f.id}
                            onClick={() => setActiveId(f.id)}
                            className="cursor-pointer relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all group"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFichaParaDeletar(f.id);
                              }}
                              className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                              title="Deletar Ficha"
                            >
                              ❌
                            </button>
                            <div className="absolute top-0 left-0 h-full w-1 bg-violet-600 rounded-l-2xl" />
                            <div className="text-2xl font-bold text-white mb-1 group-hover:text-violet-300">
                              {f.dados?.profile?.nome || "Personagem Sem Nome"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                              👤 {f.dados?.profile?.jogador || "Jogador Desconhecido"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              📖 {f.dados?.profile?.origem || "Sem origem"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                              ⚔️ {f.dados?.profile?.classe || "Sem classe"}
                            </div>
                            <div className="flex gap-2 text-xs font-medium">
                              <span className="px-2 py-1 bg-red-600/40 rounded-md text-red-300">
                                HP {f.dados?.hp?.atual}/{f.dados?.hp?.max}
                              </span>
                              <span className="px-2 py-1 bg-purple-600/40 rounded-md text-purple-300">
                                SAN {f.dados?.san?.atual}/{f.dados?.san?.max}
                              </span>
                              <span className="px-2 py-1 bg-orange-600/40 rounded-md text-orange-300">
                                ESF {f.dados?.esf?.atual}/{f.dados?.esf?.max}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-zinc-500 italic">
                        Nenhuma ficha criada ainda...
                      </p>
                    )}

                    {fichaParaDeletar && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 shadow-lg">
                          <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Excluir Ficha</h2>
                          <p className="text-zinc-300 mb-6">
                            Tem certeza que deseja excluir esta ficha? Essa ação não pode ser desfeita.
                          </p>
                          <div className="flex justify-end gap-4">
                            <button
                              onClick={() => setFichaParaDeletar(null)}
                              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => {
                                deletarFicha(fichaParaDeletar);
                                setFichaParaDeletar(null);
                              }}
                              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <button
                        onClick={criarFicha}
                        className="mt-10 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md hover:shadow-violet-500/30 transition-all"
                      >
                        ➕ Criar nova ficha
                      </button>
                    </div>
                  </div>
                )
              }
            />

            <Route path="/campanhas" element={<Campanhas apiFetch={apiFetch} fichas={fichas} onAbrirFicha={setActiveId} />} />
            <Route path="/perfil" element={<Perfil apiFetch={apiFetch} />} />
            <Route path="/campanha/:codigo" element={<CampanhaConvite apiFetch={apiFetch} />} />
          </Routes>
        </>
      )}
    </BrowserRouter>
  );
}
