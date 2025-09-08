import React, { useState, useEffect } from "react";
import CRISSheet from "./CRISSheet";
import Header from "./Header";

export default function App() {
  // ----------- Estados de autenticação -----------
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // ----------- Estados das fichas -----------
  const [fichas, setFichas] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // ----------- Estado do modal de exclusão -----------
  const [fichaParaDeletar, setFichaParaDeletar] = useState(null);

  const API = "https://pressagios-login.onrender.com";

  // ----------- Funções auxiliares -----------
  async function refreshAccessToken() {
    try {
      const res = await fetch(`${API}/refresh`, {
        method: "POST",
        credentials: "include", // envia cookies
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
      credentials: "include", // necessário pro refresh token
    });

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        setIsLoggedIn(false);
        setFichas([]);
        localStorage.removeItem("token");
        throw new Error("Sessão expirada");
      }
      // refaz a requisição
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

  // Carregar token ao iniciar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      carregarFichas();
    }
  }, []);

  // ----------- Funções de autenticação -----------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        setIsLoggedIn(true);
        carregarFichas();
      } else {
        alert(data.error || "Erro no login");
      }
    } catch {
      alert("Erro de conexão com servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        setIsLoggedIn(true);
        carregarFichas();
      } else {
        alert(data.error || "Erro ao registrar");
      }
    } catch {
      alert("Erro de conexão com servidor");
    } finally {
      setLoading(false);
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

  // ----------- Funções das fichas -----------
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
      const res = await apiFetch(`/fichas/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: fichaFinal.profile?.nome || "Sem nome",
          dados: fichaFinal,
        }),
      });

      await res.json();

      setFichas((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, nome: fichaFinal.profile?.nome, dados: fichaFinal } : f
        )
      );
    } catch (err) {
      console.error("❌ Erro ao atualizar ficha", err);
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

  // Navegação do Header
  const handleNavigate = (dest) => {
    if (dest === "personagens") setActiveId(null);
    if (dest === "campanhas") alert("🚧 Em breve: Campanhas");
  };

  // ----------- Renderização -----------

  // Login/Registro
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-black text-white">
        <div className="w-96 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-lg border border-zinc-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-violet-400">
            {isRegistering ? "Criar Conta" : "Entrar"}
          </h2>

          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-700 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 mb-6 bg-zinc-900 border border-zinc-700 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500"
              } text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-violet-500/30 transition-all`}
            >
              {loading
                ? "Carregando..."
                : isRegistering
                ? "Registrar"
                : "Entrar"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-zinc-400">
            {isRegistering ? (
              <>
                Já tem conta?{" "}
                <button
                  className="text-violet-400 hover:underline"
                  onClick={() => setIsRegistering(false)}
                >
                  Fazer login
                </button>
              </>
            ) : (
              <>
                Não tem conta?{" "}
                <button
                  className="text-violet-400 hover:underline"
                  onClick={() => setIsRegistering(true)}
                >
                  Criar conta
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Ficha ativa
  if (activeId) {
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

  // Lista de fichas
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
      <Header onNavigate={handleNavigate} />
      <div className="flex justify-end p-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Sair
        </button>
      </div>

      <main className="p-8">
        <h1 className="text-3xl font-extrabold tracking-wide text-center mb-10">
          🎭 Personagens Registrados
        </h1>

        {fichas.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fichas.map((f) => (
              <div
                key={f.id}
                onClick={() => setActiveId(f.id)}
                className="cursor-pointer relative p-6 rounded-2xl
                           bg-gradient-to-br from-zinc-900 to-zinc-800
                           border border-zinc-700 hover:border-violet-500
                           hover:shadow-lg hover:shadow-violet-500/20
                           transition-all group"
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
            className="mt-10 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 
                       text-white font-semibold shadow-md hover:shadow-violet-500/30
                       transition-all"
          >
            ➕ Criar nova ficha
          </button>
        </div>
      </main>
    </div>
  );
}
