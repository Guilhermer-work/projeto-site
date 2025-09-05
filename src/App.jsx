import React, { useEffect, useState } from "react";
import CRISSheet from "./CRISSheet";
import Header from "./Header";
import AuthForm from "./AuthForm";
import FichaCard from "./FichaCard";
import DeleteModal from "./DeleteModal";

// URL do backend no Render
const API_URL = "https://pressagios-login.onrender.com";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fichas, setFichas] = useState([]);
  const [fichaSelecionada, setFichaSelecionada] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fichaParaDeletar, setFichaParaDeletar] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      carregarFichas(token);
    }
  }, []);

  const carregarFichas = async (token) => {
    try {
      const res = await fetch(`${API_URL}/fichas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFichas(data);
      }
    } catch (err) {
      console.error("Erro ao carregar fichas", err);
    }
  };

  const handleLogin = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        carregarFichas(data.token);
      } else {
        alert(data.error || "Erro no login");
      }
    } catch {
      alert("Falha ao conectar ao servidor");
    }
  };

  const handleRegister = async ({ email, password }, done) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Usuário registrado com sucesso!");
        if (done) done();
      } else {
        alert(data.error || "Erro no registro");
      }
    } catch {
      alert("Falha ao conectar ao servidor");
    }
  };

  const criarFicha = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/fichas`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nome: "Novo Personagem", dados: {} }),
    });
    const data = await res.json();
    if (res.ok) {
      setFichas([...fichas, data]);
    }
  };

  const atualizarFicha = async (id, novosDados) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/fichas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(novosDados),
    });
    if (res.ok) {
      setFichas(fichas.map(f => (f.id === id ? { ...f, ...novosDados } : f)));
    }
  };

  const confirmarDelete = (ficha) => {
    setFichaParaDeletar(ficha);
    setShowDeleteModal(true);
  };

  const deletarFicha = async () => {
    if (!fichaParaDeletar) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/fichas/${fichaParaDeletar.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setFichas(fichas.filter(f => f.id !== fichaParaDeletar.id));
      if (fichaSelecionada?.id === fichaParaDeletar.id) setFichaSelecionada(null);
    }
    setShowDeleteModal(false);
    setFichaParaDeletar(null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setFichas([]);
    setFichaSelecionada(null);
  };

  if (!isLoggedIn) {
    return <AuthForm onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onLogout={logout} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-zinc-700 bg-zinc-900 p-4 overflow-y-auto">
          <button
            onClick={criarFicha}
            className="mb-4 w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-500"
          >
            + Nova Ficha
          </button>
          {fichas.map((f) => (
            <FichaCard
              key={f.id}
              ficha={f}
              onSelect={() => setFichaSelecionada(f)}
              onDelete={() => confirmarDelete(f)}
            />
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {fichaSelecionada ? (
            <CRISSheet ficha={fichaSelecionada} onUpdate={atualizarFicha} />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              Selecione ou crie uma ficha
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        open={showDeleteModal}
        title="Excluir Ficha"
        message={`Tem certeza que deseja excluir "${fichaParaDeletar?.nome}"?`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={deletarFicha}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
