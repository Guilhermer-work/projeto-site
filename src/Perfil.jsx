import React, { useState, useEffect } from "react";

export default function Perfil({ apiFetch }) {
  const [perfil, setPerfil] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ username: "", avatar: "", bio: "" });

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      const res = await apiFetch("/me");
      const data = await res.json();
      setPerfil(data.user);
      setForm({
        username: data.user.username || "",
        avatar: data.user.avatar || "",
        bio: data.user.bio || "",
      });
    } catch (err) {
      console.error("Erro ao carregar perfil", err);
    }
  };

  const salvarPerfil = async () => {
    try {
      const res = await apiFetch("/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao salvar perfil");
      const data = await res.json();
      setPerfil(data);
      setEditando(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!perfil) return <p className="text-zinc-400">Carregando perfil...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">👤 Meu Perfil</h1>

      {!editando ? (
        <div className="max-w-lg bg-zinc-900 p-6 rounded-xl border border-zinc-700">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={perfil.avatar || "https://placehold.co/100x100?text=Avatar"}
              alt="avatar"
              className="w-20 h-20 rounded-full border border-zinc-700"
            />
            <div>
              <h2 className="text-xl font-semibold">{perfil.username || "Sem nome"}</h2>
              <p className="text-zinc-400 text-sm">{perfil.email}</p>
            </div>
          </div>
          <p className="text-zinc-300 mb-4 whitespace-pre-line">{perfil.bio || "Sem bio"}</p>
          <button
            onClick={() => setEditando(true)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
          >
            Editar Perfil
          </button>
        </div>
      ) : (
        <div className="max-w-lg bg-zinc-900 p-6 rounded-xl border border-zinc-700">
          <label className="block mb-2">Nome de Usuário</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-700 rounded-lg"
          />

          <label className="block mb-2">Avatar (URL da imagem)</label>
          <input
            type="text"
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-700 rounded-lg"
          />

          <label className="block mb-2">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-700 rounded-lg"
          />

          <div className="flex gap-2">
            <button
              onClick={salvarPerfil}
              className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
            >
              Salvar
            </button>
            <button
              onClick={() => setEditando(false)}
              className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
