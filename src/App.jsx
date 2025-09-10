import React, { useState, useEffect } from "react";
import CRISSheet from "./CRISSheet";
import Header from "./Header";
import Campanhas from "./Campanhas";
import Perfil from "./Perfil";
import LoginPage from "./LoginPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CampanhaConvite from "./CampanhaConvite";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(true);
  const [fichas, setFichas] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [fichaParaDeletar, setFichaParaDeletar] = useState(null);

  const API = "https://pressagios-login.onrender.com";

  async function refreshAccessToken() {
    try {
      const res = await fetch(`${API}/refresh`, { method: "POST", credentials: "include" });
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
      if (Array.isArray(data)) setFichas(data);
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
    const fichaFinal = { ...fichaAtual.dados, ...novosDados };
    try {
      await apiFetch(`/fichas/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: fichaFinal.profile?.nome || "Sem nome",
          dados: fichaFinal,
        }),
      });
      setFichas((prev) =>
        prev.map((f) => (f.id === id ? { ...f, nome: fichaFinal.profile?.nome, dados: fichaFinal } : f))
      );
    } catch {
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
      await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
    } catch {}
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setFichas([]);
  };

  if (loadingLogin) return null;

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => { setIsLoggedIn(true); carregarFichas(); }} />;
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

        {/* Personagens */}
        <Route
          path="/personagens"
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
                        {/* ... conteúdo do card da ficha ... */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-zinc-500 italic">Nenhuma ficha criada ainda...</p>
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

        {/* Campanhas */}
        <Route path="/campanhas" element={<Campanhas apiFetch={apiFetch} fichas={fichas} onAbrirFicha={setActiveId} />} />

        {/* Perfil */}
        <Route path="/perfil" element={<Perfil apiFetch={apiFetch} />} />

        {/* Convite */}
        <Route path="/campanha/:codigo" element={<CampanhaConvite apiFetch={apiFetch} />} />
      </Routes>
    </BrowserRouter>
  );
}
