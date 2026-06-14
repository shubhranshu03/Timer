"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── Constants ──────────────────────────────────────────────────
const TOTAL_HOURS = 2000;
const STAGE_HOURS = TOTAL_HOURS / 5; // 400h per stage

const TREE_TYPES = [
  { id: "oak",    label: "Oak",    emoji: "🌳" },
  { id: "pine",   label: "Pine",   emoji: "🌲" },
  { id: "cherry", label: "Cherry", emoji: "🌸" },
  { id: "cactus", label: "Cactus", emoji: "🌵" },
  { id: "bamboo", label: "Bamboo", emoji: "🎋" },
];

const stageLabel = ["Seed","Sprout","Sapling","Young","Full Grown"];

// ── Tree SVG ───────────────────────────────────────────────────
function TreeSVG({ type, stage, size = 80 }: { type: string; stage: number; size?: number }) {
  const col = type === "cherry" ? "#F472B6"
    : type === "cactus" ? "#4ADE80"
    : type === "bamboo" ? "#86EFAC"
    : type === "pine"   ? "#6EE7B7"
    : "#A3E635";
  const s = size;
  const cx = s/2, cy = s/2;

  if (stage === 0) return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <ellipse cx="40" cy="65" rx="10" ry="4" fill="rgba(139,90,43,0.25)"/>
      <circle cx="40" cy="59" r="5" fill={col} opacity="0.5"/>
    </svg>
  );
  if (stage === 1) return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <rect x="38" y="50" width="4" height="16" rx="2" fill="#92400e"/>
      <ellipse cx="40" cy="46" rx="9" ry="7" fill={col} opacity="0.85"/>
    </svg>
  );
  if (stage === 2) return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <rect x="37" y="44" width="6" height="22" rx="2" fill="#92400e"/>
      <ellipse cx="40" cy="38" rx="14" ry="11" fill={col} opacity="0.85"/>
      <ellipse cx="29" cy="45" rx="9" ry="7" fill={col} opacity="0.6"/>
      <ellipse cx="51" cy="45" rx="9" ry="7" fill={col} opacity="0.6"/>
    </svg>
  );
  if (stage === 3) return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <rect x="36" y="40" width="8" height="26" rx="3" fill="#78350f"/>
      <ellipse cx="40" cy="30" rx="19" ry="15" fill={col} opacity="0.9"/>
      <ellipse cx="25" cy="39" rx="11" ry="9" fill={col} opacity="0.7"/>
      <ellipse cx="55" cy="39" rx="11" ry="9" fill={col} opacity="0.7"/>
      <ellipse cx="40" cy="44" rx="13" ry="9" fill={col} opacity="0.65"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 80 80" width={s} height={s}>
      <rect x="35" y="38" width="10" height="28" rx="4" fill="#78350f"/>
      <ellipse cx="40" cy="24" rx="23" ry="18" fill={col}/>
      <ellipse cx="23" cy="34" rx="14" ry="11" fill={col} opacity="0.8"/>
      <ellipse cx="57" cy="34" rx="14" ry="11" fill={col} opacity="0.8"/>
      <ellipse cx="40" cy="40" rx="17" ry="11" fill={col} opacity="0.75"/>
      {type === "cherry" && <>
        <circle cx="32" cy="20" r="2" fill="#fda4af"/>
        <circle cx="46" cy="16" r="2.5" fill="#fda4af"/>
        <circle cx="52" cy="27" r="2" fill="#fda4af"/>
        <circle cx="36" cy="31" r="1.5" fill="#fda4af"/>
      </>}
    </svg>
  );
}

// ── Full-screen Garden Scene ───────────────────────────────────
function GardenScene({ trees }: { trees: { type: string; stage: number }[] }) {
  // Stable random positions using seeded index
  const positions = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      top: `${10 + (i * 37) % 38}%`,
      left: `${(i * 73 + 11) % 97}%`,
      size: 1 + (i % 2),
      op: 0.2 + (i % 5) * 0.08,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg,#020c1b 0%,#061a0e 55%,#0d2e10 100%)" }}>
      {/* Stars */}
      {positions.current.map((p, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{ width: p.size, height: p.size, top: p.top, left: p.left, opacity: p.op }}/>
      ))}

      {/* Moon */}
      <div className="absolute top-8 right-16 w-14 h-14 rounded-full"
        style={{ background: "radial-gradient(circle at 35% 35%, rgba(255,255,220,0.22), rgba(255,255,200,0.06))", boxShadow: "0 0 40px rgba(255,255,200,0.12)" }}/>

      {/* Distant treeline silhouette */}
      <div className="absolute bottom-[28%] left-0 right-0 h-24 opacity-20"
        style={{ background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 100'%3E%3Cpath d='M0,100 L0,60 L30,20 L60,60 L80,30 L110,60 L140,10 L170,50 L200,25 L230,55 L260,15 L290,50 L320,30 L350,60 L380,20 L410,55 L440,35 L470,60 L500,25 L530,55 L560,15 L590,50 L620,30 L650,60 L680,20 L710,55 L740,35 L770,60 L800,25 L830,55 L860,15 L890,50 L920,30 L950,60 L980,20 L1010,55 L1040,35 L1070,60 L1100,25 L1130,55 L1160,15 L1190,50 L1200,60 L1200,100 Z' fill='%23134d11'/%3E%3C/svg%3E\") no-repeat bottom/cover" }}/>

      {/* Ground layers */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "30%" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#0d3a10 0%,#082008 100%)" }}/>
        {/* Grass texture lines */}
        {Array.from({length:12},(_,i)=>(
          <div key={i} className="absolute bottom-0 w-px opacity-20"
            style={{ height:`${30+i*8}px`, left:`${i*9+3}%`, background:"#4ade80", borderRadius:"2px" }}/>
        ))}
      </div>

      {/* Ground path */}
      <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-20 rounded-full opacity-20"
        style={{ height:"45%", background:"radial-gradient(ellipse,rgba(180,140,80,0.4),transparent)" }}/>

      {/* Trees */}
      {trees.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-white/30 text-sm">Your garden is empty</p>
            <p className="text-white/20 text-xs mt-1">Plant a tree from the panel →</p>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-[25%] left-0 right-0 flex items-end justify-center gap-2 sm:gap-4 px-8 flex-wrap">
          {trees.map((t, i) => {
            const treeSize = 60 + t.stage * 16;
            return (
              <div key={i} className="flex flex-col items-center transition-all duration-1000"
                style={{ filter: `drop-shadow(0 ${4+t.stage*3}px ${8+t.stage*4}px rgba(0,0,0,0.5))` }}>
                <TreeSVG type={t.type} stage={t.stage} size={treeSize}/>
              </div>
            );
          })}
        </div>
      )}

      {/* Fireflies */}
      {[1,2,3,4].map(i=>(
        <div key={i} className="absolute w-1 h-1 rounded-full"
          style={{
            background:"#fde68a", opacity: 0.6,
            top:`${35+i*10}%`, left:`${15+i*18}%`,
            animation:`firefly ${2+i*0.7}s ease-in-out infinite alternate`,
            boxShadow:"0 0 4px #fde68a",
          }}/>
      ))}

      <style>{`
        @keyframes firefly {
          from { transform: translate(0,0); opacity: 0.2; }
          to   { transform: translate(${Math.random()*20-10}px,${Math.random()*20-10}px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

// ── Main Forest Page ───────────────────────────────────────────
export default function ForestPage() {
  const [studyMins,  setStudyMins]  = useState(0);
  const [trees,      setTrees]      = useState<{type:string;stage:number;planted:number}[]>([]);
  const [activeTree, setActiveTree] = useState("oak");
  const [showPlant,  setShowPlant]  = useState(false);
  const [selected,   setSelected]   = useState<number|null>(null);

  useEffect(() => {
    try {
      setStudyMins(parseInt(localStorage.getItem("focusly_study_minutes") || "0", 10));
      setTrees(JSON.parse(localStorage.getItem("focusly_forest") || "[]"));
    } catch {}
  }, []);

  const totalHours = studyMins / 60;
  const computeStage = (planted: number) => Math.min(4, Math.floor(Math.max(0, totalHours - planted) / STAGE_HOURS));
  const liveTrees = trees.map(t => ({ ...t, stage: computeStage(t.planted) }));

  const plantTree = () => {
    const updated = [...trees, { type: activeTree, stage: 0, planted: totalHours }];
    setTrees(updated);
    localStorage.setItem("focusly_forest", JSON.stringify(updated));
    setShowPlant(false);
  };

  const removeTree = (i: number) => {
    const updated = trees.filter((_, idx) => idx !== i);
    setTrees(updated);
    localStorage.setItem("focusly_forest", JSON.stringify(updated));
    setSelected(null);
  };

  const growPct = Math.min(100, (totalHours / TOTAL_HOURS) * 100);

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ fontFamily: "var(--font-syne), sans-serif" }}>

      {/* ── FULL-SCREEN GARDEN ── */}
      <GardenScene trees={liveTrees}/>

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-5">
        <Link href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-white transition-all"
          style={{ background:"rgba(0,0,0,0.35)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Timer
        </Link>

        <div className="px-4 py-1.5 rounded-full text-xs font-semibold"
          style={{ background:"rgba(0,0,0,0.4)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.7)" }}>
          🌿 Your Forest · {liveTrees.length} tree{liveTrees.length!==1?"s":""}
        </div>

        <div className="px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background:"rgba(0,0,0,0.35)", backdropFilter:"blur(12px)", border:"1px solid rgba(178,139,255,0.2)", color:"#B18BFF" }}>
          ⏱ {totalHours.toFixed(1)}h studied
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="absolute right-4 top-16 bottom-4 z-20 w-72 flex flex-col gap-3 overflow-y-auto"
        style={{ scrollbarWidth:"none" }}>

        {/* Progress card */}
        <div className="rounded-2xl p-4"
          style={{ background:"rgba(5,10,20,0.80)", backdropFilter:"blur(20px)", border:"1px solid rgba(178,139,255,0.15)" }}>
          <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Grow Your Tree</p>
          <p className="text-white font-bold text-sm mb-3">2000 hours to full grown</p>

          {/* Stage markers */}
          <div className="relative mb-2">
            <div className="h-2 rounded-full" style={{ background:"rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width:`${growPct}%`, background:"linear-gradient(90deg,#7432FF,#B18BFF)" }}/>
            </div>
            <div className="flex justify-between mt-1.5">
              {stageLabel.map((l,i) => (
                <span key={i} className="text-[9px]"
                  style={{ color: totalHours >= i*STAGE_HOURS ? "#B18BFF" : "rgba(255,255,255,0.2)" }}>
                  {["🌱","🌿","🪴","🌳","🏆"][i]}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl p-2 text-center" style={{ background:"rgba(255,255,255,0.05)" }}>
              <p className="text-base font-bold" style={{ color:"#B18BFF" }}>{totalHours.toFixed(1)}h</p>
              <p className="text-[10px] text-white/35">Studied</p>
            </div>
            <div className="rounded-xl p-2 text-center" style={{ background:"rgba(255,255,255,0.05)" }}>
              <p className="text-base font-bold" style={{ color:"#B18BFF" }}>{Math.max(0,TOTAL_HOURS-totalHours).toFixed(0)}h</p>
              <p className="text-[10px] text-white/35">Remaining</p>
            </div>
          </div>
        </div>

        {/* Plant button / form */}
        {!showPlant ? (
          <button onClick={() => setShowPlant(true)}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white active:scale-95 transition-all"
            style={{ background:"linear-gradient(90deg,#7432FF,#B18BFF)", boxShadow:"0 4px 20px rgba(116,50,255,0.4)" }}>
            🌱 Plant a New Tree
          </button>
        ) : (
          <div className="rounded-2xl p-4"
            style={{ background:"rgba(5,10,20,0.85)", backdropFilter:"blur(20px)", border:"1px solid rgba(178,139,255,0.2)" }}>
            <p className="text-white font-bold text-sm mb-1">Choose tree type</p>
            <p className="text-white/35 text-[10px] mb-3">Grows as you study · {TOTAL_HOURS}h to fully grow</p>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {TREE_TYPES.map(t => (
                <button key={t.id} onClick={() => setActiveTree(t.id)}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs transition-all"
                  style={activeTree===t.id
                    ? { background:"linear-gradient(135deg,rgba(116,50,255,0.4),rgba(177,139,255,0.2))", border:"1px solid rgba(178,139,255,0.5)" }
                    : { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-base">{t.emoji}</span>
                  <span className="text-[9px] text-white/50">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={plantTree}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white active:scale-95"
                style={{ background:"linear-gradient(90deg,#7432FF,#B18BFF)" }}>
                Plant {TREE_TYPES.find(t=>t.id===activeTree)?.emoji}
              </button>
              <button onClick={() => setShowPlant(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium active:scale-95"
                style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.5)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tree preview — all types × all stages */}
        <div className="rounded-2xl p-4"
          style={{ background:"rgba(5,10,20,0.80)", backdropFilter:"blur(20px)", border:"1px solid rgba(178,139,255,0.12)" }}>
          <p className="text-white/50 text-[10px] uppercase tracking-widest mb-3">All Tree Previews</p>
          <div className="overflow-x-auto" style={{ scrollbarWidth:"none" }}>
            <table className="w-full" style={{ borderCollapse:"separate", borderSpacing:"4px" }}>
              <thead>
                <tr>
                  <th className="text-[9px] text-white/30 text-left pb-1 pr-1">Tree</th>
                  {["🌱","🌿","🪴","🌳","🏆"].map((e,i)=>(
                    <th key={i} className="text-[9px] text-white/30 text-center pb-1">{e}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TREE_TYPES.map(t => (
                  <tr key={t.id}>
                    <td className="text-[10px] text-white/50 pr-2 align-middle whitespace-nowrap">{t.emoji} {t.label}</td>
                    {[0,1,2,3,4].map(stage => (
                      <td key={stage} className="text-center align-bottom">
                        <div className="flex items-end justify-center"
                          style={{ height:`${32+stage*10}px` }}>
                          <TreeSVG type={t.id} stage={stage} size={24+stage*8}/>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[9px] text-white/20 mt-2 text-center">Each stage = {STAGE_HOURS} study hours</p>
        </div>

        {/* Tree list */}
        {liveTrees.length > 0 && (
          <div className="rounded-2xl p-4"
            style={{ background:"rgba(5,10,20,0.80)", backdropFilter:"blur(20px)", border:"1px solid rgba(178,139,255,0.12)" }}>
            <p className="text-white/50 text-[10px] uppercase tracking-widest mb-3">Your Trees</p>
            <div className="flex flex-col gap-2">
              {liveTrees.map((t, i) => {
                const info = TREE_TYPES.find(x=>x.id===t.type)!;
                const pct = Math.round((t.stage/4)*100);
                return (
                  <div key={i}
                    onClick={() => setSelected(selected===i?null:i)}
                    className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all"
                    style={{ background: selected===i ? "rgba(116,50,255,0.15)" : "rgba(255,255,255,0.04)", border: selected===i ? "1px solid rgba(178,139,255,0.35)" : "1px solid rgba(255,255,255,0.06)" }}>
                    <TreeSVG type={t.type} stage={t.stage} size={36}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold">{info.emoji} {info.label}</p>
                      <p className="text-[10px]" style={{ color: t.stage===4?"#B18BFF":"rgba(255,255,255,0.35)" }}>{stageLabel[t.stage]}</p>
                      <div className="h-1 rounded-full mt-1" style={{ background:"rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width:`${pct}%`, background:"linear-gradient(90deg,#7432FF,#B18BFF)" }}/>
                      </div>
                    </div>
                    {selected===i && (
                      <button onClick={e=>{e.stopPropagation();removeTree(i);}}
                        className="text-white/30 hover:text-red-400 transition-colors text-xs px-1">✕</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
