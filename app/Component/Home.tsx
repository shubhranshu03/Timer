"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const QUOTES = [
  "Do the work. Every day.",
  "One session at a time.",
  "Focus is a superpower.",
  "Depth beats multitasking.",
  "Lock in. Block out.",
  "Show up. Again and again.",
  "Small reps. Big results.",
  "Consistency is the cheat code.",
  "Today's effort is tomorrow's edge.",
  "Build the habit. Forget the mood.",
  "Doubt less. Do more.",
  "Progress, not perfection.",
  "Hard now, easy later.",
  "The work is the reward.",
  "Start before you're ready.",
  "25 minutes can change everything.",
  "Time spent focused is never wasted.",
  "The clock runs either way — use it.",
  "Every minute is a choice.",
  "Future you is watching right now.",
  "Push past the resistance.",
  "Tired is temporary. Results aren't.",
  "Stay when it gets hard.",
  "Discipline outlasts motivation.",
  "No shortcut beats the reps.",
  "Breathe. Focus. Execute.",
  "One tab. One task. One win.",
  "Less scroll. More soul.",
  "Close it. Start it. Finish it.",
  "You're closer than you think.",
];

const TRACKS = [
  { label: "Rain Under Roof",  emoji: "🌧️", src: "/alex_jauk-rain-under-roof-ambience-314378.mp3" },
  { label: "Calming Rain",     emoji: "🌦️", src: "/liecio-calming-rain-257596.mp3" },
  { label: "Mid Nights",       emoji: "🌙", src: "/ncprime-mid-nights-sound-291477.mp3" },
  { label: "Ocean Waves",      emoji: "🌊", src: "/solarmusic-ocean-waves-112906.mp3" },
  { label: "Fire Crackling",   emoji: "🔥", src: "/soundreality-fire-sound-334130.mp3" },
  { label: "Thunder",          emoji: "⛈️", src: "/soundreality-thunder-sound-375727.mp3" },
  { label: "Wind",             emoji: "🌬️", src: "/soundreality-wind-blowing-457954.mp3" },
  { label: "Library Ambience", emoji: "📚", src: "/u_dreamysoul-library-ambience-542977.mp3" },
];

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmtTime(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.22 + 0.3);
      osc.start(ctx.currentTime + i * 0.22);
      osc.stop(ctx.currentTime + i * 0.22 + 0.35);
    });
  } catch {}
}

const DURATIONS = [
  { label: "5m",  minutes: 5  },
  { label: "25m", minutes: 25 },
  { label: "45m", minutes: 45 },
  { label: "60m", minutes: 60 },
];

interface Task { id: number; text: string; done: boolean; }

const panelStyle: React.CSSProperties = {
  background: "rgba(10,8,30,0.82)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(178,139,255,0.15)",
};

const iconBtnStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#7432FF,#B18BFF)",
  border: "1px solid rgba(178,139,255,0.25)",
  boxShadow: "0 4px 20px rgba(116,50,255,0.45)",
};

// ── Streak Heatmap ─────────────────────────────────────────────
function StreakHeatmap({ visitedDays, currentStreak }: { visitedDays: Set<string>; currentStreak: number }) {
  const now        = new Date();
  const year       = now.getFullYear();
  const month      = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow   = new Date(year, month, 1).getDay();
  const monthName  = now.toLocaleString("default", { month: "long", year: "numeric" });
  const todayStr   = now.toISOString().slice(0, 10);
  const DAY_LABELS = ["S","M","T","W","T","F","S"];

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = cells.length / 7;

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">{monthName}</span>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-auto"
          style={{ background: "linear-gradient(90deg,#7432FF,#B18BFF)", color: "#fff" }}>
          🔥 {currentStreak}d
        </span>
      </div>
      {/* Day labels */}
      <div className="flex gap-[3px] mb-1">
        {DAY_LABELS.map((l, i) => (
          <div key={i} className="text-[8px] text-white/25 text-center" style={{ width: 14 }}>{l}</div>
        ))}
      </div>
      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${weeks}, 14px)`, gridTemplateRows: "repeat(7, 14px)", gap: "3px" }}>
        {Array.from({ length: 7 }, (_, row) =>
          Array.from({ length: weeks }, (_, col) => {
            const cell = cells[col * 7 + row];
            if (!cell) return <div key={`e-${row}-${col}`} style={{ width: 14, height: 14 }} />;
            const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(cell).padStart(2,"0")}`;
            const visited = visitedDays.has(dateStr);
            const isToday = dateStr === todayStr;
            const isFuture = new Date(dateStr) > now;
            return (
              <div key={dateStr} title={dateStr}
                style={{
                  width: 14, height: 14, borderRadius: 2,
                  background: isFuture ? "rgba(255,255,255,0.04)" : visited ? "linear-gradient(135deg,#7432FF,#B18BFF)" : "rgba(255,255,255,0.07)",
                  border: isToday ? "1px solid rgba(178,139,255,0.5)" : "none",
                }}
              />
            );
          })
        )}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[9px] text-white/25">Less</span>
        {["rgba(255,255,255,0.07)","rgba(116,50,255,0.4)","linear-gradient(135deg,#7432FF,#B18BFF)"].map((bg, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: bg }} />
        ))}
        <span className="text-[9px] text-white/25">More</span>
      </div>
    </div>
  );
}

// ── Custom Duration Pill ───────────────────────────────────────
function CustomDurationPill({ isRunning, onSet }: { isRunning: boolean; onSet: (mins: number) => void }) {
  const [open, setOpen] = useState(false);
  const [val, setVal]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const n = parseInt(val, 10);
    if (n > 0 && n <= 999) { onSet(n); setOpen(false); setVal(""); }
  };

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80); }, [open]);

  return (
    <>
      {/* + button */}
      <button
        onClick={() => !isRunning && setOpen(true)}
        disabled={isRunning}
        className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.70)" }}
        title="Custom duration"
      >
        +
      </button>

      {/* Modal popup */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => { setOpen(false); setVal(""); }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Card */}
          <div className="relative rounded-2xl p-6 w-[280px] flex flex-col gap-4"
            style={{ background: "rgba(15,10,40,0.95)", border: "1px solid rgba(178,139,255,0.25)", boxShadow: "0 8px 40px rgba(116,50,255,0.35)" }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-white font-bold text-base">Set custom timer</p>
              <button onClick={() => { setOpen(false); setVal(""); }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Input */}
            <div className="flex items-center rounded-xl px-4 py-3 gap-2"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(178,139,255,0.20)" }}>
              <input
                ref={inputRef}
                type="number" min="1" max="999"
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setOpen(false); setVal(""); } }}
                placeholder="e.g. 90"
                className="flex-1 bg-transparent outline-none text-2xl font-semibold text-white placeholder:text-white/20 tabular-nums w-full"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              />
              <span className="text-white/40 text-sm font-medium">min</span>
            </div>

            {/* Quick presets */}
            <div className="flex gap-2 flex-wrap">
              {[10,20,30,90,120].map(m => (
                <button key={m} onClick={() => { onSet(m); setOpen(false); setVal(""); }}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95"
                  style={{ background: "rgba(116,50,255,0.15)", color: "#B18BFF", border: "1px solid rgba(116,50,255,0.25)" }}>
                  {m}m
                </button>
              ))}
            </div>

            {/* Set button */}
            <button onClick={commit}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(90deg,#7432FF,#B18BFF)", boxShadow: "0 4px 20px rgba(116,50,255,0.40)" }}>
              Set Timer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Mode Switcher ──────────────────────────────────────────────
type AppMode = "timer" | "clock" | "pomodoro" | "stopwatch";

const MODES: { id: AppMode; label: string; icon: string }[] = [
  { id: "timer",     label: "Timer",     icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 5v5l3 3" },
  { id: "clock",     label: "Clock",     icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4l2.5 2.5" },
  { id: "pomodoro",  label: "Pomodoro",  icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM8 12h4V8" },
  { id: "stopwatch", label: "Stopwatch", icon: "M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zM12 7v5l3 2M9 1h6" },
];

function ModeSwitcher({ mode, onChange }: { mode: AppMode; onChange: (m: AppMode) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-2xl"
      style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {MODES.map(m => (
        <button key={m.id} onClick={() => onChange(m.id)}
          className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold transition-all active:scale-95"
          style={mode === m.id
            ? { background: "linear-gradient(135deg,#7432FF,#B18BFF)", color: "#fff", boxShadow: "0 2px 14px rgba(116,50,255,0.5)" }
            : { color: "rgba(255,255,255,0.35)", background: "transparent" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={m.icon}/>
          </svg>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Clock display ──────────────────────────────────────────────
function ClockFace() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = time.getHours(), m = time.getMinutes(), s = time.getSeconds();
  const hDeg = (h % 12) * 30 + m * 0.5;
  const mDeg = m * 6;
  const sDeg = s * 6;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pill-row spacer — matches pill row height of timer/pomodoro */}
      <div className="h-9" />

      {/* Clock circle */}
      <div className="relative flex items-center justify-center">
        {/* Mobile 240×240 */}
        <svg width="240" height="240" className="sm:hidden">
          <circle cx="120" cy="120" r="94" fill="none" stroke="rgba(178,139,255,0.12)" strokeWidth="2"/>
          {Array.from({length:12},(_,i)=>{
            const a=(i*30-90)*Math.PI/180;
            return <line key={i} x1={120+94*0.85*Math.cos(a)} y1={120+94*0.85*Math.sin(a)} x2={120+94*0.95*Math.cos(a)} y2={120+94*0.95*Math.sin(a)} stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>;
          })}
          {(()=>{ const a=(hDeg-90)*Math.PI/180; return <line x1="120" y1="120" x2={120+56*Math.cos(a)} y2={120+56*Math.sin(a)} stroke="white" strokeWidth="3" strokeLinecap="round"/>; })()}
          {(()=>{ const a=(mDeg-90)*Math.PI/180; return <line x1="120" y1="120" x2={120+77*Math.cos(a)} y2={120+77*Math.sin(a)} stroke="white" strokeWidth="2" strokeLinecap="round"/>; })()}
          {(()=>{ const a=(sDeg-90)*Math.PI/180; return <line x1="120" y1="120" x2={120+82*Math.cos(a)} y2={120+82*Math.sin(a)} stroke="#B18BFF" strokeWidth="1.5" strokeLinecap="round"/>; })()}
          <circle cx="120" cy="120" r="4" fill="#B18BFF"/>
          {/* Digital time centered inside */}
          <text x="120" y="164" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="11"
            fontFamily="'Courier New',monospace" fontWeight="600">
            {pad(h)}:{pad(m)}:{pad(s)}
          </text>
        </svg>
        {/* Desktop 280×280 */}
        <svg width="280" height="280" className="hidden sm:block">
          <circle cx="140" cy="140" r="110" fill="none" stroke="rgba(178,139,255,0.12)" strokeWidth="2"/>
          {Array.from({length:12},(_,i)=>{
            const a=(i*30-90)*Math.PI/180;
            return <line key={i} x1={140+110*0.85*Math.cos(a)} y1={140+110*0.85*Math.sin(a)} x2={140+110*0.95*Math.cos(a)} y2={140+110*0.95*Math.sin(a)} stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>;
          })}
          {(()=>{ const a=(hDeg-90)*Math.PI/180; return <line x1="140" y1="140" x2={140+65*Math.cos(a)} y2={140+65*Math.sin(a)} stroke="white" strokeWidth="3" strokeLinecap="round"/>; })()}
          {(()=>{ const a=(mDeg-90)*Math.PI/180; return <line x1="140" y1="140" x2={140+90*Math.cos(a)} y2={140+90*Math.sin(a)} stroke="white" strokeWidth="2" strokeLinecap="round"/>; })()}
          {(()=>{ const a=(sDeg-90)*Math.PI/180; return <line x1="140" y1="140" x2={140+95*Math.cos(a)} y2={140+95*Math.sin(a)} stroke="#B18BFF" strokeWidth="1.5" strokeLinecap="round"/>; })()}
          <circle cx="140" cy="140" r="4" fill="#B18BFF"/>
          {/* Digital time + date centered inside the circle */}
          <text x="140" y="192" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="12"
            fontFamily="'Courier New',monospace" fontWeight="600">
            {pad(h)}:{pad(m)}:{pad(s)}
          </text>
          <text x="140" y="208" textAnchor="middle" fill="rgba(255,255,255,0.28)" fontSize="9.5"
            fontFamily="inherit">
            {time.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}
          </text>
        </svg>
      </div>

      {/* Button-row spacer — matches button row height */}
      <div className="h-11" />
    </div>
  );
}

// ── Stopwatch ──────────────────────────────────────────────────
function StopwatchFace() {
  const [ms, setMs]       = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps]   = useState<number[]>([]);
  const ref = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(() => {
    if (running) { ref.current = setInterval(() => setMs(p => p + 10), 10); }
    else { if (ref.current) clearInterval(ref.current); }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const fmt = (n: number) => {
    const min = Math.floor(n/60000), sec = Math.floor((n%60000)/1000), cs = Math.floor((n%1000)/10);
    return `${pad(min)}:${pad(sec)}.${pad(cs)}`;
  };

  const R = 110, CIRC = 2*Math.PI*R;
  const maxLap = 60000;
  const progress = Math.min(ms % maxLap, maxLap) / maxLap;
  const CIRC_SM = 2*Math.PI*94;
  const progressSm = Math.min(ms % maxLap, maxLap) / maxLap;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pill-row spacer — matches pill row height of timer/pomodoro */}
      <div className="h-9" />

      {/* Circle */}
      <div className="relative flex items-center justify-center">
        {/* Mobile 240×240 */}
        <svg width="240" height="240" className="-rotate-90 sm:hidden">
          <defs>
            <linearGradient id="swGradSm" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7432FF"/><stop offset="100%" stopColor="#B18BFF"/>
            </linearGradient>
          </defs>
          <circle cx="120" cy="120" r="94" fill="none" stroke="rgba(178,139,255,0.10)" strokeWidth="5"/>
          <circle cx="120" cy="120" r="94" fill="none" stroke="url(#swGradSm)" strokeWidth="5"
            strokeLinecap="round" strokeDasharray={CIRC_SM} strokeDashoffset={CIRC_SM*(1-progressSm)}
            style={{ transition: running ? "stroke-dashoffset 0.01s linear" : "none" }}/>
        </svg>
        {/* Desktop 280×280 */}
        <svg width="280" height="280" className="-rotate-90 hidden sm:block">
          <defs>
            <linearGradient id="swGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7432FF"/><stop offset="100%" stopColor="#B18BFF"/>
            </linearGradient>
          </defs>
          <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(178,139,255,0.10)" strokeWidth="5"/>
          <circle cx="140" cy="140" r={R} fill="none" stroke="url(#swGrad)" strokeWidth="5"
            strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC*(1-progress)}
            style={{ transition: running ? "stroke-dashoffset 0.01s linear" : "none" }}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl tabular-nums"
            style={{ color:"#fff", fontFamily:"'Courier New',monospace", fontWeight:600, letterSpacing:"0.02em", filter:"drop-shadow(0 0 12px rgba(255,255,255,0.2))" }}>
            {fmt(ms)}
          </span>
          {laps.length > 0 && <span className="text-xs text-white/40 mt-1">Lap {laps.length+1}</span>}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button onClick={() => setRunning(r => !r)}
          className="px-8 py-2.5 rounded-2xl text-sm font-bold text-white active:scale-95 transition-all"
          style={{ background: "linear-gradient(90deg,#7432FF,#B18BFF)", boxShadow: "0 4px 20px rgba(116,50,255,0.45)" }}>
          {running ? "Stop" : "Start"}
        </button>
        <button onClick={() => { if (running) setLaps(l => [...l, ms]); else { setMs(0); setLaps([]); } }}
          className="px-8 py-2.5 rounded-2xl text-sm font-bold active:scale-95 transition-all"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(178,139,255,0.20)" }}>
          {running ? "Lap" : "Reset"}
        </button>
      </div>

      {/* Laps list — below buttons so layout above is stable */}
      {laps.length > 0 && (
        <div className="max-h-24 overflow-y-auto flex flex-col gap-1 w-48">
          {[...laps].reverse().map((l,i) => (
            <div key={i} className="flex justify-between text-xs px-3 py-1 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
              <span>Lap {laps.length-i}</span><span className="tabular-nums font-medium">{fmt(l)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pomodoro ───────────────────────────────────────────────────
const POMO_FOCUS = 25*60, POMO_BREAK = 5*60;
function PomodoroFace() {
  const [focusMins, setFocusMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const [editOpen,  setEditOpen]  = useState(false);
  const [editFocus, setEditFocus] = useState("25");
  const [editBreak, setEditBreak] = useState("5");

  const [phase, setPhase]         = useState<"focus"|"break">("focus");
  const [remaining, setRemaining] = useState(25*60);
  const [running, setRunning]     = useState(false);
  const [cycle, setCycle]         = useState(1);
  const ref       = useRef<ReturnType<typeof setInterval>|null>(null);
  const phaseRef  = useRef<"focus"|"break">("focus");
  const focusRef  = useRef(25*60);
  const breakRef  = useRef(5*60);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { focusRef.current = focusMins*60; }, [focusMins]);
  useEffect(() => { breakRef.current = breakMins*60; }, [breakMins]);

  const total    = phase === "focus" ? focusMins*60 : breakMins*60;
  const R        = 110, CIRC = 2*Math.PI*R;
  const offset   = CIRC * (1 - remaining/total);
  const CIRC_SM  = 2*Math.PI*94;
  const offsetSm = CIRC_SM * (1 - remaining/total);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            if (phaseRef.current === "focus") {
              // Focus ended → play chime, switch to break
              playChime();
              phaseRef.current = "break";
              setPhase("break");
              return breakRef.current;
            } else {
              // Break ended → play bell once, switch to focus
              try {
                const bell = new Audio("/soundreality-bell-fx-410608.mp3");
                bell.loop = false;
                bell.play().catch(() => {});
              } catch {}
              phaseRef.current = "focus";
              setPhase("focus");
              setCycle(c => c + 1);
              return focusRef.current;
            }
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const reset = () => {
    setRunning(false); setPhase("focus");
    phaseRef.current = "focus";
    setRemaining(focusRef.current); setCycle(1);
  };

  const applyEdit = () => {
    const f = Math.max(1, Math.min(120, parseInt(editFocus)||25));
    const b = Math.max(1, Math.min(60,  parseInt(editBreak)||5));
    setFocusMins(f); setBreakMins(b);
    focusRef.current = f*60; breakRef.current = b*60;
    setPhase("focus"); phaseRef.current = "focus";
    setRemaining(f*60); setRunning(false); setCycle(1);
    setEditOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top row: phase pills + cycle + settings */}
      <div className="flex gap-2 items-center">
        {(["focus","break"] as const).map(p => (
          <button key={p}
            onClick={() => {
              if (running) return;
              setPhase(p); phaseRef.current = p;
              setRemaining(p === "focus" ? focusRef.current : breakRef.current);
            }}
            className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
            style={phase===p
              ? { background: "linear-gradient(90deg,#7432FF,#B18BFF)", color:"#fff" }
              : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
            {p}
          </button>
        ))}
        <span className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
          #{cycle}
        </span>
        {/* Settings gear */}
        <button onClick={() => { if (!running) { setEditFocus(String(focusMins)); setEditBreak(String(breakMins)); setEditOpen(true); }}}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
          title="Edit durations">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setEditOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
          <div className="relative rounded-2xl p-6 w-[260px] flex flex-col gap-4"
            style={{ background:"rgba(15,10,40,0.95)", border:"1px solid rgba(178,139,255,0.25)", boxShadow:"0 8px 40px rgba(116,50,255,0.35)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-white font-bold text-sm">Pomodoro Settings</p>
              <button onClick={() => setEditOpen(false)} className="text-white/40 hover:text-white/80">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-white/50 text-xs mb-1">Focus (min)</p>
                <input type="number" min="1" max="120" value={editFocus}
                  onChange={e => setEditFocus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent outline-none tabular-nums"
                  style={{ border:"1px solid rgba(178,139,255,0.25)", fontFamily:"'Courier New',monospace" }}/>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">Break (min)</p>
                <input type="number" min="1" max="60" value={editBreak}
                  onChange={e => setEditBreak(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent outline-none tabular-nums"
                  style={{ border:"1px solid rgba(178,139,255,0.25)", fontFamily:"'Courier New',monospace" }}/>
              </div>
            </div>
            <button onClick={applyEdit}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white active:scale-95 transition-all"
              style={{ background:"linear-gradient(90deg,#7432FF,#B18BFF)", boxShadow:"0 4px 20px rgba(116,50,255,0.40)" }}>
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Circle */}
      <div className="relative flex items-center justify-center">
        <svg width="240" height="240" className="-rotate-90 sm:hidden">
          <defs>
            <linearGradient id="pomGradSm" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={phase==="focus"?"#7432FF":"#20C080"}/>
              <stop offset="100%" stopColor={phase==="focus"?"#B18BFF":"#60EFBE"}/>
            </linearGradient>
          </defs>
          <circle cx="120" cy="120" r="94" fill="none" stroke="rgba(178,139,255,0.10)" strokeWidth="5"/>
          <circle cx="120" cy="120" r="94" fill="none" stroke="url(#pomGradSm)" strokeWidth="5"
            strokeLinecap="round" strokeDasharray={CIRC_SM} strokeDashoffset={offsetSm}
            style={{ transition: running ? "stroke-dashoffset 1s linear" : "none" }}/>
        </svg>
        <svg width="280" height="280" className="-rotate-90 hidden sm:block">
          <defs>
            <linearGradient id="pomGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={phase==="focus"?"#7432FF":"#20C080"}/>
              <stop offset="100%" stopColor={phase==="focus"?"#B18BFF":"#60EFBE"}/>
            </linearGradient>
          </defs>
          <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(178,139,255,0.10)" strokeWidth="5"/>
          <circle cx="140" cy="140" r={R} fill="none" stroke="url(#pomGrad)" strokeWidth="5"
            strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
            style={{ transition: running ? "stroke-dashoffset 1s linear" : "none" }}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl tabular-nums"
            style={{ color:"#fff", fontFamily:"'Courier New',monospace", fontWeight:600, letterSpacing:"0.05em", filter:"drop-shadow(0 0 12px rgba(255,255,255,0.25))" }}>
            {fmtTime(remaining)}
          </span>
          <span className="mt-1 text-xs uppercase tracking-widest font-semibold"
            style={{ color: phase==="focus" ? "#B18BFF" : "#60EFBE" }}>
            {phase} · {phase==="focus" ? focusMins : breakMins}m
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button onClick={() => setRunning(r => !r)}
          className="px-8 py-2.5 rounded-2xl text-sm font-bold text-white active:scale-95 transition-all"
          style={{ background: "linear-gradient(90deg,#7432FF,#B18BFF)", boxShadow: "0 4px 20px rgba(116,50,255,0.45)" }}>
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={reset}
          className="px-8 py-2.5 rounded-2xl text-sm font-bold active:scale-95 transition-all"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(178,139,255,0.20)" }}>
          Reset
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function Home() {
  // ── Timer ──
  const [appMode, setAppMode] = useState<AppMode>("timer");

  // ── Background ──
  const [bgPanelOpen, setBgPanelOpen] = useState(false);
  // null = default video, "b1"..."b8" = image
  const [bgChoice, setBgChoice] = useState<string|null>(null);
  const BG_IMAGES = ["b1","b2","b3","b4","b5","b6","b7","b8"];
  const [duration,  setDuration]  = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [total,     setTotal]     = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [done,      setDone]      = useState(false);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Tasks ──
  const [taskPanelOpen, setTaskPanelOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "", done: false },
    { id: 2, text: "", done: false },
    { id: 3, text: "", done: false },
  ]);
  const nextId = useRef(4);
  const addTask    = () => setTasks(t => [...t, { id: nextId.current++, text: "", done: false }]);
  const removeTask = (id: number) => setTasks(t => t.filter(x => x.id !== id));
  const updateTask = (id: number, text: string) => setTasks(t => t.map(x => x.id === id ? { ...x, text } : x));
  const toggleTask = (id: number) => setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));

  // ── Music ──
  const [musicPanelOpen, setMusicPanelOpen] = useState(false);
  const [activeTrack,    setActiveTrack]    = useState<number | null>(null);
  const [isPlaying,      setIsPlaying]      = useState(false);
  const [volume,         setVolume]         = useState(0.6);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true; audio.volume = 0.6;
    // Prevent pausing on page blur/minimize (mobile)
    audio.onpause = () => {
      if (isPlaying && audioRef.current) {
        setTimeout(() => { audioRef.current?.play().catch(() => {}); }, 100);
      }
    };
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, [isPlaying]);

  useEffect(() => {
    if (activeTrack === null || !audioRef.current) return;
    const a = audioRef.current;
    a.pause(); a.src = TRACKS[activeTrack].src; a.loop = true; a.load();
    a.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [activeTrack]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  // Handle page visibility to keep audio playing on mobile
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App is hidden - stop music
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      } else {
        // App became visible again - resume if was playing
        if (isPlaying && audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {}); }
  };
  const selectTrack = (idx: number) => {
    if (activeTrack === idx) { togglePlay(); return; }
    setActiveTrack(idx);
  };

  // ── Streak ──
  const [visitedDays,    setVisitedDays]    = useState<Set<string>>(new Set());
  const [currentStreak,  setCurrentStreak]  = useState(0);

  useEffect(() => {
    const key = "focusly_visited_days";
    const today = new Date().toISOString().slice(0, 10);
    let stored: string[] = [];
    try { stored = JSON.parse(localStorage.getItem(key) || "[]"); } catch {}
    if (!stored.includes(today)) stored.push(today);
    localStorage.setItem(key, JSON.stringify(stored));
    const set = new Set(stored);
    setVisitedDays(set);
    let streak = 0;
    const d = new Date();
    while (true) {
      const ds = d.toISOString().slice(0, 10);
      if (set.has(ds)) { streak++; d.setDate(d.getDate() - 1); } else break;
    }
    setCurrentStreak(streak);
  }, []);

  // ── Circle ──
  const R    = 110;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - remaining / total);

  const onComplete = useCallback(() => {
    setIsRunning(false); setDone(true);
    if (tickerRef.current) clearInterval(tickerRef.current);
    playChime();
    // Save study minutes to localStorage for forest
    try {
      const key = "focusly_study_minutes";
      const prev = parseInt(localStorage.getItem(key) || "0", 10);
      localStorage.setItem(key, String(prev + duration));
    } catch {}
  }, [duration]);

  useEffect(() => {
    if (isRunning) {
      tickerRef.current = setInterval(() => {
        setRemaining(r => { if (r <= 1) { onComplete(); return 0; } return r - 1; });
      }, 1000);
    } else { if (tickerRef.current) clearInterval(tickerRef.current); }
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, [isRunning, onComplete]);

  const handleDuration = (mins: number) => {
    if (isRunning) return;
    setDuration(mins); setTotal(mins * 60); setRemaining(mins * 60); setDone(false);
  };
  const toggleTimer = () => { setDone(false); setIsRunning(r => !r); };
  const resetTimer  = () => { setIsRunning(false); setRemaining(total); setDone(false); };

  const todayQuote = QUOTES[(new Date().getDate() - 1) % QUOTES.length];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ fontFamily: "var(--font-syne), sans-serif" }}>

      {/* BG — video or image */}
      {bgChoice === null ? (
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/a3.mp4" type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/${bgChoice}.jpg`} alt="bg" className="absolute inset-0 w-full h-full object-cover"/>
      )}
      <div className="absolute inset-0 bg-black/50" />

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-4 sm:px-8 pt-5 sm:pt-8">
        {/* Branding */}
        <div>
          <p className="text-3xl sm:text-5xl font-extrabold text-white leading-none tracking-tight"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
            Focusly
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] sm:text-sm font-semibold tracking-[0.18em] text-white/60 uppercase">
              by Shubh
            </p>
            <a href="https://x.com/martin745943021" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center w-5 h-5 rounded-md transition-all hover:scale-110 active:scale-95"
              style={{ background: "rgba(255,255,255,0.10)" }}
              title="Follow on X">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Daily quote — hidden on very small screens */}
        <div className="hidden sm:block max-w-[280px] lg:max-w-[320px] text-right">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1 font-semibold">
            Day {new Date().getDate()}
          </p>
          <p className="text-white text-sm lg:text-base font-semibold leading-relaxed"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
            &ldquo;{todayQuote}&rdquo;
          </p>
        </div>
      </div>

      {/* ── STREAK HEATMAP — left side on desktop, below timer on mobile ── */}
      <div className="hidden lg:block absolute left-6 top-1/2 -translate-y-1/2 z-10">
        <StreakHeatmap visitedDays={visitedDays} currentStreak={currentStreak} />
      </div>

      {/* ── TIMER (center) ── */}
      <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 px-4 mt-20 sm:mt-0">

        {/* Mode switcher */}
        <ModeSwitcher mode={appMode} onChange={m => { setAppMode(m); setIsRunning(false); resetTimer(); }} />

        {/* ── TIMER mode ── */}
        {appMode === "timer" && (<>
        {/* Duration pills */}
        <div className="flex gap-2 items-center flex-wrap justify-center">
          {DURATIONS.map(d => (
            <button key={d.label} onClick={() => handleDuration(d.minutes)} disabled={isRunning}
              className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all active:scale-95 disabled:cursor-not-allowed"
              style={duration === d.minutes
                ? { background: "linear-gradient(90deg,#7432FF,#B18BFF)", color: "#fff", boxShadow: "0 4px 20px rgba(116,50,255,0.45)" }
                : { background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}>
              {d.label}
            </button>
          ))}
          <CustomDurationPill isRunning={isRunning} onSet={handleDuration} />
        </div>

        {/* Circle */}
        <div className="relative flex items-center justify-center">
          <svg width="240" height="240" className="-rotate-90 sm:hidden">
            <defs><linearGradient id="arcGradSm" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7432FF"/><stop offset="100%" stopColor="#B18BFF"/></linearGradient></defs>
            <circle cx="120" cy="120" r="94" fill="none" stroke="rgba(178,139,255,0.12)" strokeWidth="5"/>
            <circle cx="120" cy="120" r="94" fill="none" stroke="url(#arcGradSm)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={2*Math.PI*94} strokeDashoffset={(2*Math.PI*94)*(1-remaining/total)}
              style={{ transition: isRunning ? "stroke-dashoffset 1s linear" : "none" }}/>
          </svg>
          <svg width="280" height="280" className="-rotate-90 hidden sm:block">
            <defs><linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7432FF"/><stop offset="100%" stopColor="#B18BFF"/></linearGradient></defs>
            <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(178,139,255,0.12)" strokeWidth="5"/>
            <circle cx="140" cy="140" r={R} fill="none" stroke="url(#arcGrad)" strokeWidth="5"
              strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
              style={{ transition: isRunning ? "stroke-dashoffset 1s linear" : "none" }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl tabular-nums"
              style={{ color: "#fff", fontFamily: "'Courier New', Courier, monospace", fontWeight: 600, letterSpacing: "0.05em", filter: "drop-shadow(0 0 12px rgba(255,255,255,0.25))" }}>
              {fmtTime(remaining)}
            </span>
            {done && <span className="mt-2 text-xs font-semibold uppercase tracking-widest animate-pulse" style={{ color: "#B18BFF" }}>Done!</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button onClick={toggleTimer}
            className="px-8 py-2.5 rounded-2xl text-sm font-bold text-white active:scale-95 transition-all"
            style={{ background: "linear-gradient(90deg,#7432FF,#B18BFF)", boxShadow: "0 6px 28px rgba(116,50,255,0.50)" }}>
            {isRunning ? "Pause" : "Start"}
          </button>
          <button onClick={resetTimer}
            className="px-8 py-2.5 rounded-2xl text-sm font-bold active:scale-95 transition-all"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(178,139,255,0.20)" }}>
            Reset
          </button>
        </div>
        </>)}

        {/* ── CLOCK mode ── */}
        {appMode === "clock" && <ClockFace />}

        {/* ── POMODORO mode ── */}
        {appMode === "pomodoro" && <PomodoroFace />}

        {/* ── STOPWATCH mode ── */}
        {appMode === "stopwatch" && <StopwatchFace />}

        {/* Quote on mobile (below timer) */}
        <div className="sm:hidden max-w-[300px] text-center px-2">
          <p className="text-white/70 text-sm font-medium leading-relaxed italic">
            &ldquo;{todayQuote}&rdquo;
          </p>
        </div>

        {/* Streak heatmap on mobile (below timer) */}
        <div className="lg:hidden mt-1">
          <StreakHeatmap visitedDays={visitedDays} currentStreak={currentStreak} />
        </div>
      </div>

      {/* ── FULLSCREEN button — desktop only ── */}
      <button
        onClick={() => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else document.exitFullscreen();
        }}
        className="hidden sm:flex absolute bottom-6 right-8 z-10 w-9 h-9 rounded-xl items-center justify-center transition-all active:scale-95"
        style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(178,139,255,0.20)" }}
        title="Toggle fullscreen"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
      </button>

      {/* ── BG PICKER — all screens, above fullscreen on desktop / bottom-right on mobile ── */}
      <div className="flex flex-col items-end absolute bottom-[80px] sm:bottom-[80px] right-4 sm:right-8 z-10">
        {bgPanelOpen && (
          <div className="mb-3 rounded-2xl p-3"
            style={{ background:"rgba(10,8,30,0.90)", backdropFilter:"blur(18px)", border:"1px solid rgba(178,139,255,0.15)" }}>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 text-center">Background</p>
            <div className="grid grid-cols-3 gap-2">
              {/* Default video option */}
              <button
                onClick={() => { setBgChoice(null); setBgPanelOpen(false); }}
                className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: "rgba(116,50,255,0.15)",
                  border: bgChoice === null ? "2px solid #B18BFF" : "2px solid rgba(255,255,255,0.08)",
                  boxShadow: bgChoice === null ? "0 0 10px rgba(116,50,255,0.5)" : "none",
                }}
                title="Default video">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B18BFF" strokeWidth="2" strokeLinecap="round">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </button>
              {/* Image options */}
              {BG_IMAGES.map(b => (
                <button key={b}
                  onClick={() => { setBgChoice(b); setBgPanelOpen(false); }}
                  className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all active:scale-95"
                  style={{
                    border: bgChoice === b ? "2px solid #B18BFF" : "2px solid rgba(255,255,255,0.08)",
                    boxShadow: bgChoice === b ? "0 0 10px rgba(116,50,255,0.5)" : "none",
                  }}
                  title={b}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/${b}.jpg`} alt={b} className="w-full h-full object-cover"/>
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => setBgPanelOpen(o => !o)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={bgPanelOpen
            ? iconBtnStyle
            : { background:"rgba(255,255,255,0.10)", border:"1px solid rgba(178,139,255,0.20)" }}
          title="Change background">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.70)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        </button>
      </div>

      {/* ── BOTTOM ICONS (task + music + forest) ── */}
      <div className="absolute bottom-5 left-4 sm:bottom-6 sm:left-16 z-10 flex gap-3 items-end">

        {/* Forest button — hidden for now */}
        <a href="/forest"
          className="hidden w-9 h-9 rounded-xl items-center justify-center transition-all active:scale-95"
          style={iconBtnStyle} title="Grow Your Tree">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22V12"/>
            <path d="M12 12C12 12 8 9 8 5a4 4 0 0 1 8 0c0 4-4 7-4 7z"/>
            <path d="M12 12C12 12 16 9 16 5"/>
            <path d="M9 22h6"/>
          </svg>
        </a>

        {/* Tasks */}
        <div className="flex flex-col items-start">
          {taskPanelOpen && (
            <div className="w-[280px] sm:w-[300px] rounded-2xl p-4 mb-3" style={panelStyle}>
              {/* Header with close */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#7432FF,#B18BFF)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                    <path d="M9 12h6M9 16h4"/>
                  </svg>
                </div>
                <span className="text-white font-bold text-base flex-1">Tasks</span>
                <button onClick={() => setTaskPanelOpen(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Task rows */}
              <div className="flex flex-col gap-2 mb-3">
                {tasks.map(task => (
                  <div key={task.id}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
                    style={{
                      background: task.done ? "rgba(74,222,128,0.07)" : "rgba(255,255,255,0.06)",
                      border: task.done ? "1px solid rgba(74,222,128,0.25)" : "1px solid rgba(255,255,255,0.08)",
                    }}>
                    {/* Checkbox */}
                    <button onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all active:scale-90"
                      style={task.done
                        ? { background: "linear-gradient(135deg,#22c55e,#4ade80)", boxShadow: "0 0 8px rgba(74,222,128,0.4)" }
                        : { background: "transparent", border: "1.5px solid rgba(255,255,255,0.25)" }}>
                      {task.done && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>

                    {/* Input */}
                    <input value={task.text} onChange={e => updateTask(task.id, e.target.value)}
                      placeholder="Type your priority"
                      readOnly={task.done}
                      className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-white/25"
                      style={{
                        color: task.done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
                        textDecoration: task.done ? "line-through" : "none",
                      }}
                    />

                    {/* Done badge — inside row */}
                    {task.done && (
                      <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
                        Done
                      </span>
                    )}

                    {/* Remove — inside row */}
                    <button onClick={() => removeTask(task.id)}
                      className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white/25 hover:text-white/60 transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addTask} className="w-full py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: "rgba(116,50,255,0.15)", color: "#B18BFF", border: "1px solid rgba(116,50,255,0.30)" }}>
                + Add Task
              </button>
            </div>
          )}
          <button onClick={() => setTaskPanelOpen(o => !o)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={iconBtnStyle} title="Tasks">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
          </button>
        </div>

        {/* Music */}
        <div className="flex flex-col items-start">
          {musicPanelOpen && (
            <div className="w-[280px] sm:w-[300px] rounded-2xl p-4 mb-3" style={panelStyle}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#7432FF,#B18BFF)" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                  </div>
                  <span className="text-white font-bold text-base">Sounds</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeTrack !== null && (
                    <button onClick={togglePlay}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95"
                      style={{ background: "linear-gradient(135deg,#7432FF,#B18BFF)" }}>
                      {isPlaying
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        : <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>}
                    </button>
                  )}
                  <button onClick={() => setMusicPanelOpen(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/10 active:scale-95"
                    style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {TRACKS.map((track, idx) => {
                  const active = activeTrack === idx;
                  return (
                    <button key={idx} onClick={() => selectTrack(idx)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all active:scale-95"
                      style={active
                        ? { background: "linear-gradient(135deg,rgba(116,50,255,0.35),rgba(177,139,255,0.25))", border: "1px solid rgba(178,139,255,0.40)" }
                        : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <span className="text-base">{track.emoji}</span>
                      <span className="text-xs font-medium leading-tight"
                        style={{ color: active ? "#D4AAFF" : "rgba(255,255,255,0.70)" }}>
                        {track.label}
                      </span>
                      {active && isPlaying && (
                        <span className="ml-auto flex gap-[2px] items-end" style={{ height: "14px" }}>
                          {[3,5,4,6,3].map((h, b) => (
                            <span key={b} className="w-[2px] rounded-full"
                              style={{ height: `${h}px`, background: "#B18BFF", animation: `eq-bar 0.${6+b}s ease-in-out infinite alternate` }}/>
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-white/40 uppercase tracking-widest">Volume</span>
                  <span className="text-[11px] font-semibold" style={{ color: "#B18BFF" }}>{Math.round(volume * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  </svg>
                  <div className="relative flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
                    <div className="absolute left-0 top-0 h-full rounded-full"
                      style={{ width: `${volume * 100}%`, background: "linear-gradient(90deg,#7432FF,#B18BFF)" }}/>
                    <input type="range" min="0" max="1" step="0.01" value={volume}
                      onChange={e => setVolume(Number(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"/>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                </div>
              </div>

              <style>{`@keyframes eq-bar { from { transform:scaleY(0.4); } to { transform:scaleY(1.8); } }`}</style>
            </div>
          )}
          <button onClick={() => setMusicPanelOpen(o => !o)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={iconBtnStyle} title="Sounds">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
