import React, { useMemo, useState, useEffect } from "react";

/**
 * C.R.I.S. — Character Sheet (Clone)
 * Single-file React component with TailwindCSS.
 * Controlado por props: recebe `ficha` e envia mudanças via `onUpdate`.
 *
 * Mantém a essência visual e de funcionalidades do original,
 * mas remove estados locais de dados do personagem para persistir no App.jsx.
 */

// 🔹 Componente reutilizável para inputs com debounce
function DebouncedInput({ value, onChange, delay = 300, ...props }) {
  const [local, setLocal] = useState(value);

  // quando a prop externa mudar, atualiza o valor local
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // aplica debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (local !== value) {
        onChange(local);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [local]);

  return (
    <input
      {...props}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
    />
  );
}

function DiceIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2l9 5v10l-9 5-9-5V7l9-5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
      <circle cx="7.5" cy="12" r="1" fill="currentColor" />
      <circle cx="16.5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ATTRS = [
  { key: "FOR", label: "FORÇA" },
  { key: "AGI", label: "AGILIDADE" },
  { key: "INT", label: "INTELECTO" },
  { key: "PRE", label: "PRESENÇA" },
  { key: "VIG", label: "VIGOR" },
];

const SKILLS = [
  { name: "Acrobacia", attr: "AGI" },
  { name: "Adestramento*", attr: "PRE" },
  { name: "Artes*", attr: "PRE" },
  { name: "Atletismo", attr: "FOR" },
  { name: "Atualidades", attr: "INT" },
  { name: "Ciências*", attr: "INT" },
  { name: "Crime*", attr: "AGI" },
  { name: "Diplomacia", attr: "PRE" },
  { name: "Enganação*", attr: "PRE" },
  { name: "Fortitude", attr: "VIG" },
  { name: "Furtividade*", attr: "AGI" },
  { name: "Iniciativa", attr: "AGI" },
  { name: "Intimidação", attr: "PRE" },
  { name: "Intuição", attr: "PRE" },
  { name: "Investigação", attr: "INT" },
  { name: "Luta", attr: "FOR" },
  { name: "Medicina", attr: "INT" },
  { name: "Ocultismo*", attr: "INT" },
  { name: "Percepção*", attr: "PRE" },
  { name: "Pilotagem*", attr: "AGI" },
  { name: "Pontaria", attr: "AGI" },
  { name: "Profissão*", attr: "INT" },
  { name: "Reflexos", attr: "AGI" },
  { name: "Religião*", attr: "INT" },
  { name: "Sobrevivência", attr: "INT" },
  { name: "Tática*", attr: "INT" },
  { name: "Tecnologia*", attr: "INT" },
  { name: "Vontade", attr: "PRE" },
];

function Badge({ children }) {
  return <span className="px-2 py-0.5 rounded-full text-xs border border-zinc-700 bg-zinc-800/70">{children}</span>;
}

function StatusBar({ label, atual, max, setAtual, setMax, color }) {
  const perc = Math.max(0, Math.min(100, (Number(atual) / Number(max || 1)) * 100));

  const handleChange = (delta) => {
    const next = (Number(atual) || 0) + delta;
    setAtual(Math.max(0, next)); // sem limitar ao max
  };

  const handleInputAtual = (e) => {
    const val = e.target.value;
    if (val === "") {
      setAtual("");
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setAtual(Math.max(0, num)); // pode ultrapassar o max
      }
    }
  };

  const handleBlurAtual = () => {
    if (atual === "" || isNaN(atual)) {
      setAtual(0);
    }
  };

  const handleInputMax = (e) => {
    const val = e.target.value;
    if (val === "") {
      setMax("");
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setMax(Math.max(1, num));
      }
    }
  };

  const handleBlurMax = () => {
    if (max === "" || isNaN(max)) {
      setMax(1);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mb-2">
      <div className="text-xs font-bold tracking-wide text-center text-zinc-200 mb-1">
        {label.toUpperCase()}
      </div>
      <div className="relative flex items-center h-6 border border-zinc-700 rounded-md overflow-hidden">
        
        {/* Botões esquerda */}
        <div className="flex">
          <button
            onClick={() => handleChange(-5)}
            className="px-1 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            ≪
          </button>
          <button
            onClick={() => handleChange(-1)}
            className="px-1 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            ＜
          </button>
        </div>

        {/* Barra colorida */}
        <div className="relative flex-1 h-full">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${perc}%`,
              backgroundColor: color,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-100">
            {/* Atual */}
            <input
              type="text"
              value={atual}
              onChange={handleInputAtual}
              onBlur={handleBlurAtual}
              className="w-10 bg-transparent text-center font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="mx-1">/</span>
            {/* Máximo */}
            <input
              type="text"
              value={max}
              onChange={handleInputMax}
              onBlur={handleBlurMax}
              className="w-10 bg-transparent text-center font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Botões direita */}
        <div className="flex">
          <button
            onClick={() => handleChange(1)}
            className="px-1 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            ＞
          </button>
          <button
            onClick={() => handleChange(5)}
            className="px-1 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            ≫
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, right, children, className = "" }) {
  return (
    <div className={`bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-zinc-200 font-medium tracking-wide text-sm">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function Collapsible({ title, subtitle, children, action }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-zinc-700 rounded-xl overflow-hidden">
      <div
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 hover:bg-zinc-800 transition cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <div className="text-zinc-200 font-medium">{title}</div>
          {subtitle && (
            <div className="text-xs text-zinc-400">{subtitle}</div>
          )}
        </div>
        {action && (
          <div onClick={(e) => e.stopPropagation()}>{action}</div>
        )}
      </div>
      {open && <div className="p-4 bg-black/30">{children}</div>}
    </div>
  );
}

function AttributeWheel({ attrs, rollAttr }) {
  const order = ["AGI", "INT", "VIG", "PRE", "FOR"];
  return (
    <div className="relative w-64 h-64 mx-auto">
      <div className="absolute inset-0 rounded-full border-2 border-zinc-700" />
      {order.map((k, i) => {
        const angle = (i / order.length) * 2 * Math.PI - Math.PI / 2;
        const r = 110;
        const cx = 128 + r * Math.cos(angle);
        const cy = 128 + r * Math.sin(angle);
        const val = attrs[k] ?? 0;
        return (
          <button
            key={k}
            onClick={() => rollAttr(k)}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center cursor-pointer group"
            style={{ left: cx, top: cy }}
          >
            <div className="w-12 h-12 rounded-full grid place-items-center border border-purple-500 bg-black text-white text-lg font-semibold transition group-hover:bg-purple-700/30">
              {val}
            </div>
            <div className="mt-1 text-[10px] text-zinc-400 tracking-wider">{k}</div>
          </button>
        );
      })}
    </div>
  );
}


function Roller({ onRoll }) {
  const [expr, setExpr] = useState("1d20+3");
  const [result, setResult] = useState(null);

  function roll() {
    const m = expr.match(/^(\d*)d(\d+)([+\-]\d+)?$/i);
    if (!m) return;
    const count = Number(m[1] || 1);
    const faces = Number(m[2]);
    const mod = Number(m[3] || 0);
    const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * faces));
    const total = rolls.reduce((a, b) => a + b, 0) + mod;
    const payload = { expr, rolls, mod, total };
    setResult(payload);
    onRoll?.(payload);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      <div className="text-sm text-zinc-300">Rolar dados</div>
      <div className="flex gap-2">
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          className="flex-1 bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="Ex.: 2d6+1"
        />
        <button
          onClick={roll}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium"
        >
          <DiceIcon className="w-4 h-4" /> Rolar
        </button>
      </div>
      {result && (
        <div className="rounded-xl border border-violet-600/50 p-3 text-zinc-200">
          <div className="text-xs text-zinc-400">Resultado</div>
          <div className="text-lg font-semibold">{result.total}</div>
          <div className="text-xs text-zinc-400">
            {result.expr} ⇒ [{result.rolls.join(", ")}] {result.mod >= 0 ? "+" : ""}
            {result.mod}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CRISSheet({ ficha, onUpdate, onVoltar, somenteVisualizar }) {

  const [dados, setDados] = useState(dadosIniciais);

  // Atualiza estado sempre que ficha mudar
  useEffect(() => {
    setDados(ficha || {});
  }, [ficha]);

  // Função genérica para editar campos
  const atualizarCampo = (campo, valor) => {
    if (somenteVisualizar) return; // 🔒 bloqueia edição se for só visualização
    const novos = { ...dados, [campo]: valor };
    setDados(novos);
    onUpdate && onUpdate(novos);
  };

  // 🔹 Desestrutura e define padrões para evitar valores undefined em inputs controlados
  const profile = dados.profile ?? { nome: "", origem: "", jogador: "", classe: "" };
  const attrs = dados.attrs ?? { FOR: 0, AGI: 0, INT: 0, PRE: 0, VIG: 0 };

  const hp = dados.hp ?? { atual: 10, max: 10 };
  const san = dados.san ?? { atual: 10, max: 10 };
  const esf = dados.esf ?? { atual: 10, max: 10 };
  const def = dados.def ?? { def: 10, bloqueio: 0, esquiva: 0 };
  const ataques = dados.ataques ?? [];
  const pericias = dados.pericias ?? SKILLS.map((s) => ({ ...s, treino: 0, outros: 0 }));

  // 🔹 Estado local apenas para UI efêmera (resultados de rolagem, abas, colapsáveis, etc.)
  const [rollResult, setRollResult] = useState(null);

  // Helpers
  function parseNum(val) {
    const n = parseInt(String(val).replace(/[^0-9-]/g, ""), 10);
    return Number.isNaN(n) ? 0 : n;
  }

  // 🔄 Atualizações sincronizadas com App.jsx
  const updateProfileField = (field, value) => {
    if (somenteVisualizar) return;
    onUpdate({
      profile: { ...profile, [field]: value },
    });
  };

  const updateAttr = (key, value) => {
    if (somenteVisualizar) return;
    const num = Number(value);
    onUpdate({
      attrs: { ...attrs, [key]: Number.isNaN(num) ? 0 : num },
    });
  };

  const updateBar = (bar, field, value) => {
    if (somenteVisualizar) return;
    const current = bar === "hp" ? hp : bar === "san" ? san : esf;
    const updated = { ...current, [field]: value };
    onUpdate({ [bar]: updated });
  };

  const updatePericia = (name, field, value) => {
    if (somenteVisualizar) return;
    const next = pericias.map((p) =>
      p.name === name 
        ? { ...p, [field]: field === "attr" ? value : parseNum(value) } 
        : p
    );
    onUpdate({ pericias: next });
  };

  const addAtaque = () => {
    if (somenteVisualizar) return;
    const novo = { id: Date.now(), nome: "Novo Ataque", dano: "1d6", crit: "20/x2", tipo: "", attr: "FOR", skill: "Luta", desc: "" };
    onUpdate({ ataques: [...ataques, novo] });
  };

  const updateAtaque = (idx, patch) => {
    if (somenteVisualizar) return;
    const next = ataques.map((a, i) => (i === idx ? { ...a, ...patch } : a));
    onUpdate({ ataques: next });
  };

  // 🎲 Rolagens (mesma lógica do original, só usando `attrs`/`pericias`/`ataques` vindos da ficha)
function rollSkill(p) {
  const attrValue = attrs[p.attr] ?? 0;
  const isPenalty = attrValue <= 0;
  const diceCount = isPenalty ? Math.abs(attrValue) + 2 : attrValue;
  const rolls = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 20));
  const chosen = isPenalty ? Math.min(...rolls) : Math.max(...rolls);

  const mod = (Number(p.treino) || 0) + (Number(p.outros) || 0);
  const total = chosen + mod;

  setRollResult({
    type: "pericia",
    name: p.name,
    attr: p.attr,
    diceCount,
    rolls,
    best: chosen,
    mod,
    total,
    isPenalty,
  });

  setTimeout(() => setRollResult(null), 5000);
}


function rollAttr(attrKey) {
  const val = attrs[attrKey] ?? 0;

  let diceCount = 1;
  let rolls = [];
  let result = 0;
  let best = 0;

  if (val > 0) {
    diceCount = val;
    rolls = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 20));
    best = Math.max(...rolls);
    result = best;
  } else {
    diceCount = Math.abs(val) + 2; // 0 → 2 dados, -1 → 3 dados...
    rolls = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 20));
    best = Math.min(...rolls);
    result = best;
  }

  setRollResult({
    type: "atributo",
    name: attrKey,
    diceCount,
    rolls,
    best,
    total: result,
    isPenalty: val <= 0,
  });

  setTimeout(() => setRollResult(null), 5000);
}

  function parseCrit(critStr) {
    if (!critStr) return { critMin: 20, critMult: 2 }; // padrão

    // Suporta formatos: "19/x2", "19/2x", "19x2", "19/5", "18/x10"
    const match = critStr.match(/(\d+)(?:[\/]?(?:x)?(\d+))?/i);

    if (match) {
      const critMin = parseInt(match[1], 10) || 20;
      const critMult = parseInt(match[2], 10) || 2;
      return { critMin, critMult };
    }
    return { critMin: 20, critMult: 2 };
  }

  function parseDamage(danoStr, isCrit, critMult) {
    // Exemplo: "2d8+3", "1d12-1", "d20", "3d6"
    const m = danoStr?.toLowerCase().match(/(\d*)d(\d+)([+\-]\d+)?/);
    if (!m) return { rolls: [0], total: 0 };

    let qtd = parseInt(m[1] || "1", 10);
    const faces = parseInt(m[2], 10);
    const mod = parseInt(m[3] || "0", 10);

    if (isCrit) qtd *= critMult; // multiplica dados no crítico

    const rolls = Array.from({ length: qtd }, () => 1 + Math.floor(Math.random() * faces));
    const total = rolls.reduce((a, b) => a + b, 0) + mod;

    return { rolls, total, mod };
  }

function rollAttack(a) {
  const { critMin, critMult } = parseCrit(a.crit || "20/x2");

  const attrValue = attrs[a.attr] ?? 0;
  const isPenalty = attrValue <= 0;
  const diceCount = isPenalty ? Math.abs(attrValue) + 2 : attrValue;
  const d20s = Array.from({ length: diceCount }, () => 1 + Math.floor(Math.random() * 20));
  const chosen = isPenalty ? Math.min(...d20s) : Math.max(...d20s);
  const isCrit = chosen >= critMin;

  const skill = pericias.find((p) => p.name === a.skill);
  const mod = (Number(skill?.treino) || 0) + (Number(skill?.outros) || 0);

  const { rolls, total: danoTotal } = parseDamage(a.dano, isCrit, critMult);

  setRollResult({
    type: "ataque",
    name: a.nome,
    attr: a.attr,
    d20s,
    best: chosen,
    isCrit,
    mod,
    total: chosen + mod,
    rolls,
    danoTotal,
    critMin,
    critMult,
    tipo: a.tipo,
    isPenalty,
    diceCount,
  });

  setTimeout(() => setRollResult(null), 5000);
}

  return (
    <div className="min-h-screen bg-black text-zinc-100">

      <main className="w-full h-full px-6 py-9 grid grid-cols-[minmax(550px,780px)_1fr_minmax(250px,360px)] gap-6">
        <div className="col-span-3 mb-4">
          <button
            onClick={onVoltar}
            className="px-3 py-1.5 rounded-lg bg-violet-700 hover:bg-violet-600 text-white text-xs"
          >
            ← Voltar para Fichas
          </button>
        </div>

        {/* LEFT COLUMN */}
        <section className="space-y-3">
          <SectionCard title="Personagem">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-800" />
              <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                <label className="text-zinc-400">Personagem
                  <DebouncedInput
                    disabled={somenteVisualizar}
                    className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-1 py-0.5 text-xs"
                    value={profile.nome}
                    onChange={(v) => updateProfileField("nome", v)}
                  />
                </label>
                <label className="text-zinc-400">Jogador
                  <DebouncedInput
                    className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-1 py-0.5 text-xs"
                    value={profile.jogador}
                    onChange={(v) => updateProfileField("jogador", v)}
                  />
                </label>
                <label className="text-zinc-400">Classe
                  <DebouncedInput
                    className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-1 py-0.5 text-xs"
                    value={profile.classe}
                    onChange={(v) => updateProfileField("classe", v)}
                  />
                </label>
                <label className="text-zinc-400">Origem
                  <DebouncedInput
                    className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-1 py-0.5 text-xs"
                    value={profile.origem}
                    onChange={(v) => updateProfileField("origem", v)}
                  />
                </label>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Atributos">
            <AttributeWheel attrs={attrs} rollAttr={rollAttr} />
            <div className="grid grid-cols-5 gap-2 mt-4">
              {Object.keys(attrs).map((k) => (
                <div 
                key={k} 
                className="p-2 rounded-lg border border-zinc-700 text-center bg-zinc-900"
                >
                  <div className="text-xs text-zinc-400">{k}</div>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="^-?\d*$"
                    value={String(attrs[k])}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "" || raw === "-") {
                        updateAttr(k, raw);
                        return;
                      }
                    if (/^-?\d+$/.test(raw)) {
                      updateAttr(k, Number(raw));
                      }
                    }}
                    onBlur={(e) => {
                      if (isNaN(Number(e.target.value))) {
                        updateAttr(k, 0);
                      }
                    }}
                    className="w-full text-center bg-transparent text-white appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recursos">
            <div className="space-y-2">
              <StatusBar 
                label="Vida" 
                atual={hp.atual} 
                max={hp.max} 
                setAtual={(v) => updateBar("hp", "atual", v)}
                setMax={(v) => updateBar("hp", "max", v)}
                color="#b91c1c"
              />
              <StatusBar
                label="Sanidade" 
                atual={san.atual} 
                max={san.max}
                setAtual={(v) => updateBar("san", "atual", v)}
                setMax={(v) => updateBar("san", "max", v)}
                color="#7e22ce"
              />
              <StatusBar
                label="Esforço" 
                atual={esf.atual}
                max={esf.max}
                setAtual={(v) => updateBar("esf", "atual", v)}
                setMax={(v) => updateBar("esf", "max", v)}
                color="#ea580c"
              />
            </div>
          </SectionCard>

          <SectionCard title="Defesa" right={<Badge>10</Badge>}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xl font-bold"><ShieldIcon className="w-4 h-4" />{def.def}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-zinc-400">Bloqueio</div>
                  <div className="font-semibold">{def.bloqueio}</div>
                </div>
                <div>
                  <div className="text-zinc-400">Esquiva</div>
                  <div className="font-semibold">{def.esquiva}</div>
                </div>
              </div>
            </div>
          </SectionCard>
        </section>

        {/* MIDDLE COLUMN */}
        <section className="space-y-3">
          <SectionCard title="Perícias" right={<Badge>Dados / Bônus / Treino / Outros</Badge>}>
            <div className="max-h-[520px] overflow-auto pr-2 custom-scroll">
              <table className="w-full text-xs">
                <thead className="bg-zinc-900/70">
                  <tr className="text-left text-[11px] text-zinc-400">
                    <th className="py-1 font-medium">Perícia</th>
                    <th className="py-1">(Attr)</th>
                    <th className="py-1">Bônus</th>
                    <th className="py-1">Treino</th>
                    <th className="py-1">Outros</th>
                  </tr>
                </thead>
                <tbody>
                  {pericias.map((p) => {
                    const bonus = (Number(p.treino) || 0) + (Number(p.outros) || 0);
                    return (
                      <tr key={p.name} className="border-t border-zinc-800/80 hover:bg-zinc-800/30">
                        <td className="py-2 flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Rolar ${p.name}`}
                            onClick={() => rollSkill(p)}
                            className="inline-flex items-center justify-center p-0 bg-black border-0 text-zinc-400 hover:text-white focus:outline-none focus:ring-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                              <rect x="4" y="4" width="16" height="16" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="1.75" />
                              <circle cx="9" cy="9" r="1.25" fill="currentColor" />
                              <circle cx="15" cy="15" r="1.25" fill="currentColor" />
                            </svg>
                          </button>
                          {p.name}
                        </td>
                        <td className="py-2 text-center">
                          <select
                            value={p.attr}
                            onChange={(e) => updatePericia(p.name, "attr", e.target.value)}
                            className="bg-black border border-zinc-700 rounded px-1 py-0.5 text-sm"
                          >
                            {ATTRS.map((at) => (
                              <option key={at.key} value={at.key}>{at.key}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2 text-center">{bonus}</td>

                        <td className="py-2 text-center">
                          <select
                            value={p.treino}
                            onChange={(e) => updatePericia(p.name, "treino", e.target.value)}
                            className="bg-black border border-zinc-700 rounded px-1 py-0.5 text-sm"
                          >
                            {[0, 5, 10, 15, 20, 25, 30].map((val) => (
                              <option key={val} value={val}>{val}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 text-center">
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updatePericia(p.name, "outros", e.currentTarget.textContent)}
                            className="outline-none"
                          >
                            {p.outros}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {rollResult?.type === "pericia" && (
              <div className="fixed bottom-4 right-4 bg-zinc-900 border border-violet-600 rounded-xl p-4 shadow-lg max-w-sm">
                <div className="text-xs text-zinc-400">Rolagem de Perícia: {rollResult.name} ({rollResult.attr})</div>
                <div className="text-lg font-bold">{rollResult.total}</div>
                <div className="text-xs text-zinc-400">
                  {rollResult.diceCount}d20 → [{rollResult.rolls.join(", ")}] |{" "}
                  {rollResult.isPenalty ? "pior" : "melhor"}: {rollResult.best} + bônus {rollResult.mod}
                </div>
              </div>
            )}
          </SectionCard>
        </section>

        {/* RIGHT COLUMN */}
        <section className="space-y-3">
          {(() => {
            const [activeTab, setActiveTab] = useState("ataques");

            return (
              <div className="space-y-3">
                {/* Botões de abas */}
                <div className="flex gap-2 mb-3">
                  {["ataques", "habilidades", "inventario", "descricao"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        activeTab === tab
                          ? "bg-violet-600 text-white"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Conteúdo de cada aba */}
                {activeTab === "ataques" && (
                  <SectionCard title="Ataques">
                    <div className="space-y-2">
                      {ataques.map((a, idx) => (
                        <Collapsible
                          key={a.id}
                          title={a.nome}
                          subtitle={`Dano: ${a.dano} • Crítico: ${a.crit}`}
                          action={
                            <button
                              onClick={() => rollAttack(a)}
                              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                              title="Rolar ataque"
                            >
                              <DiceIcon className="w-4 h-4" />
                            </button>
                          }
                        >
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <label className="text-zinc-400 text-[11px]">Nome
                              <DebouncedInput
                                value={a.nome}
                                onChange={(v) => updateAtaque(idx, { nome: v })}
                                className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-1 py-0.5 text-xs"
                              />
                            </label>
                            <label className="text-zinc-400 text-[11px]">Dano
                              <DebouncedInput
                                value={a.dano}
                                onChange={(v) => updateAtaque(idx, { dano: v })}
                                className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-1 py-0.5 text-xs"
                              />
                            </label>
                            <label className="text-zinc-400 text-[11px]">Crítico (ex: 19/x2)
                              <DebouncedInput
                                value={a.crit}
                                onChange={(v) => updateAtaque(idx, { crit: v })}
                                className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-1 py-0.5 text-xs"
                              />
                            </label>
                            <label className="text-zinc-400 text-[11px]">Tipo de Dano
                              <DebouncedInput
                                value={a.tipo || ""}
                                onChange={(v) => updateAtaque(idx, { tipo: v })}
                                placeholder="Corte, perfuração..."
                                className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-1 py-0.5 text-xs"
                              />
                            </label>
                            <label className="text-zinc-400 text-[11px]">Atributo
                              <select
                                value={a.attr || "FOR"}
                                onChange={(e) => updateAtaque(idx, { attr: e.target.value })}
                                className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-1 py-0.5 text-xs"
                              >
                                {ATTRS.map(at => (
                                  <option key={at.key} value={at.key}>{at.key}</option>
                                ))}
                              </select>
                            </label>
                            <label className="text-zinc-400 text-[11px]">Perícia
                              <select
                                value={a.skill || pericias[0]?.name || "Luta"}
                                onChange={(e) => updateAtaque(idx, { skill: e.target.value })}
                                className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-1 py-0.5 text-xs"
                              >
                                {pericias.map(p => (
                                  <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <label className="text-zinc-400 text-[11px] col-span-2">
                            Descrição
                            <textarea
                              value={a.desc || ""}
                              onChange={(e) => updateAtaque(idx, { desc: e.target.value })}
                              placeholder="Descrição do ataque..."
                              className="mt-1 w-full bg-black/40 border border-zinc-700 rounded px-2 py-1 text-xs"
                            />
                          </label>
                        </Collapsible>
                      ))}

                      {/* Adicionar novo ataque */}
                      <button
                        onClick={addAtaque}
                        className="w-full justify-center px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs"
                      >
                        Novo Ataque
                      </button>
                    </div>
                  </SectionCard>
                )}

                {/* Outras abas */}
                {activeTab === "habilidades" && (
                  <SectionCard title="Habilidades">
                    <p className="text-xs text-zinc-400">Lista de habilidades...</p>
                  </SectionCard>
                )}

                {activeTab === "inventario" && (
                  <SectionCard title="Inventário">
                    <p className="text-xs text-zinc-400">Itens do personagem...</p>
                  </SectionCard>
                )}

                {activeTab === "descricao" && (
                  <SectionCard title="Descrição">
                    <textarea
                      className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1 text-xs"
                      placeholder="Descrição do personagem..."
                    />
                  </SectionCard>
                )}
              </div>
            );
          })()}
        </section>

        {/* Popup de rolagem unificado */}
        {rollResult?.type === "ataque" && (
          <div className="fixed bottom-4 right-4 bg-zinc-900 border border-violet-600 rounded-xl p-4 shadow-lg max-w-sm">
            <div className="text-xs text-zinc-400">
              Ataque: {rollResult.name} ({rollResult.attr}){" "}
              {rollResult.isCrit && <span className="text-red-500 font-bold">(CRÍTICO!)</span>}
            </div>
            <div className="text-sm text-zinc-300">
              {rollResult.diceCount}d20 → [{rollResult.d20s.join(", ")}] →{" "}
              {rollResult.isPenalty ? "pior" : "melhor"}: {rollResult.best} + bônus: {rollResult.mod}
            </div>
            <div className="text-lg font-bold">Total: {rollResult.total}</div>
            <div className="text-sm text-zinc-300 mt-2">
              Dano: {rollResult.danoTotal} {rollResult.tipo && `(${rollResult.tipo})`}
            </div>
            <div className="text-xs text-zinc-400">
              {rollResult.rolls.length} dados → [{rollResult.rolls.join(", ")}]
            </div>
          </div>
        )}

        {rollResult?.type === "atributo" && (
          <div className="fixed bottom-4 right-4 bg-zinc-900 border border-violet-600 rounded-xl p-4 shadow-lg max-w-sm">
            <div className="text-xs text-zinc-400">
              Rolagem de Atributo: {rollResult.name}
            </div>
            <div className="text-lg font-bold">{rollResult.total}</div>
            <div className="text-xs text-zinc-400">
              {rollResult.diceCount}d20 → [{rollResult.rolls.join(", ")}] |{" "}
              {rollResult.isPenalty ? "pior:" : "melhor:"} {rollResult.best}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 999px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
