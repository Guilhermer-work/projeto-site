import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from "react-router-dom";
import Header from "./Header"; // Header já usa <Link> para navegar
import CRISSheet from "./CRISSheet";
import Campanhas from "./Campanhas";
import Perfil from "./Perfil";
import LoginPage from "./LoginPage";
import CampanhaConvite from "./CampanhaConvite";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(true);
  const [fichas, setFichas] = useState([]);
  const [fichaParaDeletar, setFichaParaDeletar] = useState(null);

  const API = "https://pressagios-login.onrender.com";

  // small deep merge util: merge source into target (doesn't mutate source)
  function mergeDeep(target = {}, source = {}) {
    const out = Array.isArray(target) ? [...target] : { ...target };
    Object.keys(source).forEach((key) => {
      const srcVal = source[key];
      const tgtVal = out[key];
      if (
        srcVal &&
        typeof srcVal === "object" &&
        !Array.isArray(srcVal) &&
        tgtVal &&
        typeof tgtVal === "object" &&
        !Array.isArray(tgtVal)
      ) {
        out[key] = mergeDeep(tgtVal, srcVal);
      } else {
        out[key] = srcVal;
      }
    });
    return out;
  }

  // ----- auth / fetch helpers -----
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
    const token = localStorage.getItem("token");

    // ensure headers object but don't always force Content-Type
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    // if there's a body and it's not FormData, assume JSON
    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    let res = await fetch(`${API}${url}`, {
      ...options,
      headers,
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
      // retry with new token
      const headers2 = { ...(options.headers || {}), Authorization: `Bearer ${newToken}` };
      if (options.body && !(options.body instanceof FormData) && !headers2["Content-Type"]) {
        headers2["Content-Type"] = "application/json";
      }
      res = await fetch(`${API}${url}`, { ...options, headers: headers2, credentials: "include" });
    }

    return res;
  }

  // ----- lifecycle -----
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      carregarFichas();
    }
    setLoadingLogin(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ----- CRUD fichas -----
  // criarFicha agora retorna o id criado (útil para navegar imediatamente)
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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao criar ficha");
      }
      const data = await res.json();
      // manter o formato consistente: { id, nome, dados }
      const novoObjeto = { id: data.id, nome: nova.nome, dados: nova.dados };
      setFichas((prev) => [...prev, novoObjeto]);
      return data.id;
    } catch (e) {
      alert(e.message || "Erro ao criar ficha");
      throw e;
    }
  };

  // atualizarFicha faz um merge profundo dos novos dados no objeto atual
  const atualizarFicha = async (id, novosDados) => {
    const fichaAtual = fichas.find((f) => f.id === id);
    if (!fichaAtual) throw new Error("Ficha não encontrada localmente");

    // merge profundo para não perder propriedades não enviadas
    const fichaFinal = mergeDeep(fichaAtual.dados || {}, novosDados || {});

    try {
      const res = await apiFetch(`/fichas/${id}`, {
        method: "PUT",
        body: JSON.stringify({ nome: fichaFinal.profile?.nome || "Sem nome", dados: fichaFinal }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao atualizar ficha");
      }

      setFichas((prev) => prev.map((f) => (f.id === id ? { ...f, nome: fichaFinal.profile?.nome, dados: fichaFinal } : f)));

      return true;
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao atualizar ficha");
      return false;
    }
  };

  const deletarFicha = async (id) => {
    try {
      const res = await apiFetch(`/fichas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar");
      setFichas((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      console.error(e);
      alert("Erro ao deletar ficha");
    }
  };

  // ----- logout -----
  const handleLogout = async () => {
    try {
      await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setFichas([]);
  };

  if (loadingLogin) return null;

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={() => {
          setIsLoggedIn(true);
          carregarFichas();
        }}
      />
    );
  }

  // ----- render Router + routes -----
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
        <Header />
        <div className="flex justify-end p-4">
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Sair
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/personagens" replace />} />

          <Route
            path="/personagens"
            element={
              <PersonagensPage
                fichas={fichas}
                criarFicha={criarFicha}
                setFichaParaDeletar={setFichaParaDeletar}
                onDelete={deletarFicha}
              />
            }
          />

          <Route path="/personagens/:id" element={<FichaWrapper fichas={fichas} atualizarFicha={atualizarFicha} />} />

          <Route path="/campanhas" element={<Campanhas apiFetch={apiFetch} fichas={fichas} />} />
          <Route path="/perfil" element={<Perfil apiFetch={apiFetch} />} />
          <Route path="/campanha/:codigo" element={<CampanhaConvite apiFetch={apiFetch} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// ------------------ COMPONENTES AUXILIARES ------------------

function PersonagensPage({ fichas, criarFicha, setFichaParaDeletar, onDelete }) {
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      const id = await criarFicha();
      if (id) navigate(`/personagens/${id}`);
    } catch (e) {
      // já tratado em criarFicha
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-3xl font-extrabold tracking-wide text-center mb-10">🎭 Personagens Registrados</h1>

      {fichas.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fichas.map((f) => (
            <FichaCard key={f.id} ficha={f} onClick={() => navigate(`/personagens/${f.id}`)} onDelete={() => setFichaParaDeletar(f.id)} />
          ))}
        </div>
      ) : (
        <p className="text-center text-zinc-500 italic">Nenhuma ficha criada ainda...</p>
      )}

      {/* Modal de confirmação removido por questões de espaço; use state na App para mostrar se necessário */}

      <div className="flex justify-center">
        <button onClick={handleCreate} className="mt-10 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md hover:shadow-violet-500/30 transition-all">
          ➕ Criar nova ficha
        </button>
      </div>
    </main>
  );
}

function FichaWrapper({ fichas, atualizarFicha }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const ficha = fichas.find((f) => f.id === Number(id));

  if (!ficha) return <p className="p-8 text-center text-zinc-500">Ficha não encontrada.</p>;

  return (
    <CRISSheet
      ficha={ficha.dados}
      onUpdate={(novosDados) => atualizarFicha(ficha.id, novosDados)}
      onVoltar={() => navigate("/personagens")}
    />
  );
}

function FichaCard({ ficha, onClick, onDelete }) {
  return (
    <div onClick={onClick} className="cursor-pointer relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all group">
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
      <div className="text-2xl font-bold text-white mb-1 group-hover:text-violet-300">{ficha.dados?.profile?.nome || "Personagem Sem Nome"}</div>
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">👤 {ficha.dados?.profile?.jogador || "Jogador Desconhecido"}</div>
      <div className="flex items-center gap-2 text-sm text-zinc-400">📖 {ficha.dados?.profile?.origem || "Sem origem"}</div>
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">⚔️ {ficha.dados?.profile?.classe || "Sem classe"}</div>
      <div className="flex gap-2 text-xs font-medium">
        <span className="px-2 py-1 bg-red-600/40 rounded-md text-red-300">HP {ficha.dados?.hp?.atual}/{ficha.dados?.hp?.max}</span>
        <span className="px-2 py-1 bg-purple-600/40 rounded-md text-purple-300">SAN {ficha.dados?.san?.atual}/{ficha.dados?.san?.max}</span>
        <span className="px-2 py-1 bg-orange-600/40 rounded-md text-orange-300">ESF {ficha.dados?.esf?.atual}/{ficha.dados?.esf?.max}</span>
      </div>
    </div>
  );
}
