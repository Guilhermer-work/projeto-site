import React, { useState } from "react";

export default function AuthForm({ onLogin, onRegister, loading }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      onRegister(form.email, form.password, () => setIsRegistering(false));
    } else {
      onLogin(form.email, form.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-black text-white">
      <div className="w-96 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-lg border border-zinc-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-violet-400">
          {isRegistering ? "Criar Conta" : "Entrar"}
        </h2>

        <form onSubmit={handleSubmit}>
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
