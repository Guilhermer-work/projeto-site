import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import CRISSheet from "./CRISSheet";
import CampanhaSheet from "./CampanhaSheet";
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

  // ----------- Estados das campanhas -----------
  const [campanhas, setCampanhas] = useState([]);
  const [activeCampanhaId, setActiveCampanhaId] = useState(null);

  const API = "https://pressagios.onrender.com";
  const navigate = useNavigate();

  // Carregar token ao iniciar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      carregarFichas(token);
      carregarCampanhas(token);
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
      });

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        carregarFichas(data.token);
        carregarCampanhas(data.token);
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
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Conta criada! Agora faça login.");
        setIsRegistering(false);
        setForm({ email: "", password: "" });
      } else {
        alert(data.error || "Erro ao registrar");
      }
    } catch {
      alert("Erro de conexão com servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setFichas([]);
    setCampanhas([]);
  };

  // ----------- Funções das fichas -----------
  const carregarFichas = async (token) => {
    try {
      const res = await fetch(`${API}/fichas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setFichas(data);
      }
    } catch {
      console.error("Erro ao carregar fichas");
    }
  };

  const criarFicha = async () => {
    const token = localStorage.getItem("token");
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
      const res = await fetch(`${API}/fichas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    const token = localStorage.getItem("token");
    const fichaAtual = fichas.find((f) => f.id === id);
    const fichaFinal = {
      ...fichaAtual.dados,
      ...novosDados,
    };

    try {
      await fetch(`${API}/fichas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      console.error("❌ Erro ao atualizar ficha", err);
      alert("Erro ao atualizar ficha");
    }
  };

  // ----------- Funções das campanhas -----------
  const carregarCampanhas = async (token) => {
    try {
      const res = await fetch(`${API}/campanhas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCampanhas(data);
      }
    } catch {
      console.error("Erro ao carregar campanhas");
    }
  };

  const criarCampanha = async () => {
    const token = localStorage.getItem("token");
    const nova = { titulo: "Nova Campanha", dados: { descricao: "", jogadores: [] } };

    try {
      const res = await fetch(`${API}/campanhas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nova),
      });

      const data = await res.json();
      setCampanhas([...campanhas, data]);
      setActiveCampanhaId(data.id);
      navigate(`/campanha/${data.id}`);
    } catch {
      alert("Erro ao criar campanha");
    }
  };

  const atualizarCampanha = async (id, novosDados) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/campanhas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novosDados),
      });

      setCampanhas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...novosDados } : c))
      );
    } catch {
      alert("Erro ao atualizar campanha");
    }
  };

  // Navegação do Header
  const handleNavigate = (dest) => {
    if (dest === "personagens") navigate("/");
    if (dest === "campanhas") navigate("/campanhas");
  };

  // ----------- Renderização -----------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-black text-white">
        <div className="w-96 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-lg border border-zinc-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-violet-400">
            {isRegistering ? "Criar Conta" : "Entrar"}
          </h2>

          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange}
              className="w-full p-3 mb-4 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <input type="password" name="password" placeholder="Senha" value={form.password} onChange={handleChange}
              className="w-full p-3 mb-6 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />

            <button type="submit" disabled={loading}
              className={`w-full ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-500"} text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-violet-500/30 transition-all`}>
              {loading ? "Carregando..." : isRegistering ? "Registrar" : "Entrar"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-zinc-400">
            {isRegistering ? (
              <>Já tem conta? <button className="text-violet-400 hover:underline" onClick={() => setIsRegistering(false)}>Fazer login</button></>
            ) : (
              <>Não tem conta? <button className="text-violet-400 hover:underline" onClick={() => setIsRegistering(true)}>Criar conta</button></>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<>
        <Header onNavigate={handleNavigate} />
        <div className="flex justify-end p-4"><button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">Sair</button></div>
        <main className="p-8">
          <h1 className="text-3xl font-extrabold tracking-wide text-center mb-10">🎭 Personagens Registrados</h1>
          {fichas.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fichas.map((f) => (
                <div key={f.id} onClick={() => setActiveId(f.id)} className="cursor-pointer relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all group">
                  <div className="absolute top-0 left-0 h-full w-1 bg-violet-600 rounded-l-2xl" />
                  <div className="text-2xl font-bold text-white mb-1 group-hover:text-violet-300">{f.dados?.profile?.nome || "Personagem Sem Nome"}</div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">👤 {f.dados?.profile?.jogador || "Jogador Desconhecido"}</div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">📖 {f.dados?.profile?.origem || "Sem origem"}</div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">⚔️ {f.dados?.profile?.classe || "Sem classe"}</div>
                </div>
              ))}
            </div>
          ) : (<p className="text-center text-zinc-500 italic">Nenhuma ficha criada ainda...</p>)}
          <div className="flex justify-center"><button onClick={criarFicha} className="mt-10 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md hover:shadow-violet-500/30 transition-all">➕ Criar nova ficha</button></div>
        </main>
      </>} />

      <Route path="/ficha/:id" element={activeId && <CRISSheet ficha={fichas.find(f => f.id === activeId)?.dados} onUpdate={(dados) => atualizarFicha(activeId, dados)} onVoltar={() => setActiveId(null)} />} />

      <Route path="/campanhas" element={<>
        <Header onNavigate={handleNavigate} />
        <div className="flex justify-end p-4"><button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">Sair</button></div>
        <main className="p-8">
          <h1 className="text-3xl font-extrabold tracking-wide text-center mb-10">📜 Campanhas</h1>
          {campanhas.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {campanhas.map((c) => (
                <div key={c.id} onClick={() => navigate(`/campanha/${c.id}`)} className="cursor-pointer relative p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all group">
                  <div className="absolute top-0 left-0 h-full w-1 bg-violet-600 rounded-l-2xl" />
                  <div className="text-2xl font-bold text-white mb-1 group-hover:text-violet-300">{c.titulo}</div>
                </div>
              ))}
            </div>
          ) : (<p className="text-center text-zinc-500 italic">Nenhuma campanha criada ainda...</p>)}
          <div className="flex justify-center"><button onClick={criarCampanha} className="mt-10 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md hover:shadow-violet-500/30 transition-all">➕ Criar nova campanha</button></div>
        </main>
      </>} />

      <Route path="/campanha/:id" element={activeCampanhaId && <CampanhaSheet campanha={campanhas.find(c => c.id === activeCampanhaId)} onUpdate={(dados) => atualizarCampanha(activeCampanhaId, dados)} onVoltar={() => navigate("/campanhas")} />} />
    </Routes>
  );
}
