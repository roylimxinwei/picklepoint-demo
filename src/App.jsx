import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════
   PICKLEPOINT v3 — Full Flow Interactive Demo
   ═══════════════════════════════════════════════ */

const COLORS = {
  spectator: { primary: "#94A3B8", accent: "#CBD5E1", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.25)", gradient: "linear-gradient(135deg, #94A3B8, #94A3B8)" },
  player: { primary: "#EF4444", accent: "#F87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", gradient: "linear-gradient(135deg, #DC2626, #EF4444)" },
  referee: { primary: "#EAB308", accent: "#FACC15", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.25)", gradient: "linear-gradient(135deg, #CA8A04, #EAB308)" },
  organizer: { primary: "#A855F7", accent: "#C084FC", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.25)", gradient: "linear-gradient(135deg, #9333EA, #A855F7)" },
};

const TEAMS = [
  { id: 1, names: ["A. Smith", "B. Chen"] }, { id: 2, names: ["C. Park", "D. Jones"] },
  { id: 3, names: ["E. Garcia", "F. Kim"] }, { id: 4, names: ["G. Patel", "H. Lee"] },
  { id: 5, names: ["I. Wilson", "J. Brown"] }, { id: 6, names: ["K. Davis", "L. Moore"] },
  { id: 7, names: ["M. Taylor", "N. White"] }, { id: 8, names: ["O. Martin", "P. Clark"] },
];

const COMPETITIONS = [
  { id: "comp1", name: "SG Open 2026", date: "Mar 15, 2026", venue: "Kallang Sports Hub", categories: ["Mixed Doubles A", "Men's Doubles", "Women's Singles"], playerCount: 64, status: "live" },
  { id: "comp2", name: "East Coast League", date: "Apr 2, 2026", venue: "East Coast Park Courts", categories: ["Mixed Doubles B", "Men's Singles"], playerCount: 32, status: "live" },
];

const ORG_COMPETITIONS = [
  ...COMPETITIONS,
  { id: "comp3", name: "Marina Bay Invitational 2026", date: "May 10, 2026", venue: "Marina Bay Sands Arena", categories: ["Open Singles", "Pro Doubles", "Mixed Doubles"], playerCount: 18, maxPlayers: 64, status: "registration" },
];

const DISCOVER_COMPETITIONS = [
  { id: "d1", name: "Sentosa Beach Open", date: "Apr 20, 2026", venue: "Sentosa Sports Centre", categories: ["Mixed Doubles", "Men's Singles"], playerCount: 24, maxPlayers: 48, status: "registration", organizer: "SG Pickleball Assoc", fee: "$25" },
  { id: "d2", name: "NUS Inter-Faculty Cup", date: "Mar 28, 2026", venue: "NUS Sports Hall", categories: ["Mixed Doubles", "Women's Doubles"], playerCount: 40, maxPlayers: 40, status: "full", organizer: "NUS Sports Club", fee: "Free" },
  { id: "d3", name: "Jurong West Community", date: "Apr 5, 2026", venue: "Jurong West Sports Centre", categories: ["Open Singles", "Open Doubles"], playerCount: 12, maxPlayers: 32, status: "registration", organizer: "JW Community Club", fee: "$15" },
  { id: "d4", name: "CBD Corporate Challenge", date: "Apr 18, 2026", venue: "OCBC Arena", categories: ["Corporate Doubles", "Mixed Doubles"], playerCount: 30, maxPlayers: 64, status: "registration", organizer: "CBD Sports Network", fee: "$40" },
  { id: "d5", name: "Tampines Regional", date: "May 1, 2026", venue: "Our Tampines Hub", categories: ["Men's Singles", "Women's Singles", "Mixed Doubles"], playerCount: 50, maxPlayers: 72, status: "registration", organizer: "Tampines CC", fee: "$20" },
];

const REGISTERED_PLAYERS = [
  { name: "A. Smith", email: "a.smith@email.com", category: "Mixed Doubles A", partner: "B. Chen", checkedIn: true, company: "Google", paymentStatus: "paid" },
  { name: "B. Chen", email: "b.chen@email.com", category: "Mixed Doubles A", partner: "A. Smith", checkedIn: true, company: "Google", paymentStatus: "paid" },
  { name: "C. Park", email: "c.park@email.com", category: "Mixed Doubles A", partner: "D. Jones", checkedIn: true, company: "Meta", paymentStatus: "paid" },
  { name: "D. Jones", email: "d.jones@email.com", category: "Mixed Doubles A", partner: "C. Park", checkedIn: false, company: "Meta", paymentStatus: "paid" },
  { name: "E. Garcia", email: "e.garcia@email.com", category: "Men's Doubles", partner: "F. Kim", checkedIn: true, company: "Stripe", paymentStatus: "paid" },
  { name: "F. Kim", email: "f.kim@email.com", category: "Men's Doubles", partner: "E. Garcia", checkedIn: true, company: "Stripe", paymentStatus: "paid" },
  { name: "G. Patel", email: "g.patel@email.com", category: "Men's Doubles", partner: "H. Lee", checkedIn: false, company: "Shopee", paymentStatus: "paid" },
  { name: "H. Lee", email: "h.lee@email.com", category: "Men's Doubles", partner: "H. Lee", checkedIn: true, company: "Shopee", paymentStatus: "paid" },
  { name: "I. Wilson", email: "i.wilson@email.com", category: "Women's Singles", partner: null, checkedIn: true, company: "Google", paymentStatus: "paid" },
  { name: "J. Brown", email: "j.brown@email.com", category: "Women's Singles", partner: null, checkedIn: true, company: "Grab", paymentStatus: "paid" },
  { name: "K. Davis", email: "k.davis@email.com", category: "Women's Singles", partner: null, checkedIn: false, company: "Grab", paymentStatus: "paid" },
  { name: "L. Moore", email: "l.moore@email.com", category: "Women's Singles", partner: null, checkedIn: true, company: "DBS", paymentStatus: "paid" },
];

const REG_PHASE_PLAYERS = [
  { name: "M. Zhang", email: "m.zhang@email.com", category: "Open Singles", partner: null, company: "Tiktok", paymentStatus: "paid" },
  { name: "N. Tan", email: "n.tan@email.com", category: "Open Singles", partner: null, company: "Shopee", paymentStatus: "registered" },
  { name: "O. Lim", email: "o.lim@email.com", category: "Pro Doubles", partner: "P. Wong", company: "DBS", paymentStatus: "paid" },
  { name: "P. Wong", email: "p.wong@email.com", category: "Pro Doubles", partner: "O. Lim", company: "DBS", paymentStatus: "paid" },
  { name: "Q. Singh", email: "q.singh@email.com", category: "Mixed Doubles", partner: "R. Lee", company: "Google", paymentStatus: "registered" },
  { name: "R. Lee", email: "r.lee@email.com", category: "Mixed Doubles", partner: "Q. Singh", company: "Google", paymentStatus: "registered" },
  { name: "S. Kumar", email: "s.kumar@email.com", category: "Open Singles", partner: null, company: "Grab", paymentStatus: "paid" },
  { name: "T. Ng", email: "t.ng@email.com", category: "Pro Doubles", partner: "U. Chua", company: "Meta", paymentStatus: "registered" },
  { name: "U. Chua", email: "u.chua@email.com", category: "Pro Doubles", partner: "T. Ng", company: "Meta", paymentStatus: "paid" },
];

const initialMatches = [
  { id: 1, court: 1, teamA: TEAMS[0], teamB: TEAMS[1], division: "Mixed Doubles A", round: "QF-1", games: [], currentGame: { a: 0, b: 0 }, gameNum: 1, matchScore: { a: 0, b: 0 }, status: "active", startedAt: Date.now() - 420000, scoredBy: "referee" },
  { id: 2, court: 2, teamA: TEAMS[2], teamB: TEAMS[3], division: "Mixed Doubles A", round: "QF-2", games: [], currentGame: { a: 0, b: 0 }, gameNum: 1, matchScore: { a: 0, b: 0 }, status: "active", startedAt: Date.now() - 360000, scoredBy: "player" },
  { id: 3, court: 3, teamA: TEAMS[4], teamB: TEAMS[5], division: "Men's Doubles", round: "SF-1", games: [{ a: 11, b: 8 }], currentGame: { a: 0, b: 0 }, gameNum: 2, matchScore: { a: 1, b: 0 }, status: "active", startedAt: Date.now() - 900000, scoredBy: "referee" },
  { id: 4, court: 4, teamA: TEAMS[6], teamB: TEAMS[7], division: "Men's Doubles", round: "SF-2", games: [], currentGame: { a: 0, b: 0 }, gameNum: 1, matchScore: { a: 0, b: 0 }, status: "active", startedAt: Date.now() - 180000, scoredBy: "player" },
  { id: 5, court: 5, teamA: TEAMS[0], teamB: TEAMS[4], division: "Women's Singles", round: "R1", games: [{ a: 11, b: 9 }, { a: 8, b: 11 }], currentGame: { a: 0, b: 0 }, gameNum: 3, matchScore: { a: 1, b: 1 }, status: "active", startedAt: Date.now() - 1200000, scoredBy: "referee" },
  { id: 6, court: 6, teamA: TEAMS[1], teamB: TEAMS[5], division: "Women's Singles", round: "R1", games: [{ a: 11, b: 4 }, { a: 11, b: 6 }], currentGame: { a: 0, b: 0 }, gameNum: 3, matchScore: { a: 2, b: 0 }, status: "completed", startedAt: Date.now() - 1800000, scoredBy: "player" },
];

function formatTime(ms) { const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000); return `${m}:${s.toString().padStart(2, "0")}`; }
function teamDisplay(t, short = false) { if (typeof t === "string") return t; return short ? t.names.map(n => n.split(".")[1]?.trim() || n).join("/") : t.names.join(" & "); }

// ── Shared Components ──
function TopBar({ onBack, title, right, borderColor = "rgba(255,255,255,0.06)" }) {
  return (
    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${borderColor}`, flexShrink: 0 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 17, fontFamily: "DM Sans" }}>← Back</button>
      <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 20, color: "#E8ECF4" }}>{title}</div>
      <div>{right || <div style={{ width: 40 }} />}</div>
    </div>
  );
}
function LiveDot({ color = "#22C55E" }) { return <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, animation: "pulse 2s infinite", flexShrink: 0 }} />; }
function Badge({ text, color, bg }) { return <span style={{ padding: "4px 11px", borderRadius: 6, fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 600, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>; }

function Chip({ label, active, onClick, color = "#3B82F6" }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 20, fontSize: 15, fontFamily: "DM Sans", fontWeight: 600, cursor: "pointer",
      background: active ? color + "22" : "rgba(255,255,255,0.03)",
      border: `1px solid ${active ? color + "55" : "rgba(255,255,255,0.08)"}`,
      color: active ? color : "#94A3B8", transition: "all 0.15s", whiteSpace: "nowrap"
    }}>{label}</button>
  );
}

// ══════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════
export default function PicklePoint() {
  const [view, setView] = useState("landing");
  const [matches, setMatches] = useState(initialMatches);
  const [focusMatch, setFocusMatch] = useState(null);
  const [scoreFlash, setScoreFlash] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [authed, setAuthed] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orgComps, setOrgComps] = useState(ORG_COMPETITIONS);

  useEffect(() => {
    if (view === "landing") return;
    const interval = setInterval(() => {
      setMatches(prev => prev.map(m => {
        if (m.status !== "active" || (view === "referee" && m.id === 1)) return m;
        if (m.scoredBy === "player") {
          if (Math.random() > 0.92) {
            const aW = Math.random() > 0.5;
            const score = aW ? { a: 11, b: Math.floor(Math.random() * 9) + 2 } : { a: Math.floor(Math.random() * 9) + 2, b: 11 };
            const ng = [...m.games, score];
            const nms = { a: m.matchScore.a + (aW ? 1 : 0), b: m.matchScore.b + (aW ? 0 : 1) };
            if (nms.a >= 2 || nms.b >= 2) return { ...m, games: ng, matchScore: nms, status: "completed" };
            return { ...m, games: ng, currentGame: { a: 0, b: 0 }, gameNum: m.gameNum + 1, matchScore: nms };
          }
          return m;
        }
        const t = Math.random() > 0.5 ? "a" : "b";
        const ns = { ...m.currentGame, [t]: m.currentGame[t] + 1 };
        const aW = ns.a >= 11 && ns.a - ns.b >= 2;
        const bW = ns.b >= 11 && ns.b - ns.a >= 2;
        if (aW || bW) {
          const ng = [...m.games, { a: ns.a, b: ns.b }];
          const nms = { a: m.matchScore.a + (aW ? 1 : 0), b: m.matchScore.b + (bW ? 1 : 0) };
          if (nms.a >= 2 || nms.b >= 2) return { ...m, games: ng, currentGame: ns, matchScore: nms, status: "completed" };
          return { ...m, games: ng, currentGame: { a: 0, b: 0 }, gameNum: m.gameNum + 1, matchScore: nms };
        }
        return { ...m, currentGame: ns };
      }));
    }, 2500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [view]);

  const scorePoint = useCallback((mid, t) => {
    setScoreFlash(t); setTimeout(() => setScoreFlash(null), 250);
    setMatches(prev => prev.map(m => {
      if (m.id !== mid) return m;
      setUndoStack(s => [...s, { matchId: mid, team: t, prevScore: { ...m.currentGame } }]);
      const ns = { ...m.currentGame, [t]: m.currentGame[t] + 1 };
      const aW = ns.a >= 11 && ns.a - ns.b >= 2; const bW = ns.b >= 11 && ns.b - ns.a >= 2;
      if (aW || bW) {
        const ng = [...m.games, { a: ns.a, b: ns.b }];
        const nms = { a: m.matchScore.a + (aW ? 1 : 0), b: m.matchScore.b + (bW ? 1 : 0) };
        return nms.a >= 2 || nms.b >= 2 ? { ...m, games: ng, currentGame: ns, matchScore: nms, status: "match_end" } : { ...m, games: ng, currentGame: ns, matchScore: nms, status: "game_end" };
      }
      return { ...m, currentGame: ns };
    }));
  }, []);
  const undoPoint = useCallback(() => {
    if (!undoStack.length) return;
    const last = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    setMatches(prev => prev.map(m => m.id !== last.matchId ? m : { ...m, currentGame: last.prevScore, status: "active" }));
  }, [undoStack]);
  const startNextGame = useCallback((mid) => {
    setMatches(prev => prev.map(m => m.id !== mid ? m : { ...m, currentGame: { a: 0, b: 0 }, gameNum: m.gameNum + 1, status: "active" }));
    setUndoStack([]);
  }, []);

  const goTo = (v) => { setView(v); setAuthed(false); setCheckedIn(false); setSelectedComp(null); setSelectedCategory(null); setFocusMatch(null); };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#0A0F1A", color: "#E8ECF4" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes scanLine{0%,100%{top:20%}50%{top:80%}}
        * {box-sizing:border-box}
        button{font-family:inherit}
        @media(max-width:380px){
          .pp-landing-title{font-size:36px!important}
          .pp-score-big{font-size:64px!important}
          .pp-score-focus{font-size:64px!important}
          .pp-court-grid{grid-template-columns:1fr!important}
        }
        @media(min-width:768px){
          .pp-court-grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))!important}
          .pp-org-court-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))!important}
        }
        @media(min-width:1024px){
          .pp-court-grid{grid-template-columns:repeat(3,1fr)!important}
          .pp-main-wrap{max-width:960px;margin:0 auto}
        }
        @media(min-width:1280px){
          .pp-court-grid{grid-template-columns:repeat(3,1fr)!important}
          .pp-main-wrap{max-width:1100px}
        }
      `}</style>

      {view === "landing" && <Landing onSelect={goTo} />}
      {view === "spectator" && !authed && <SpectatorAuth onAuth={() => setAuthed(true)} onBack={() => goTo("landing")} />}
      {view === "spectator" && authed && <SpectatorLive matches={matches} focusMatch={focusMatch} setFocusMatch={setFocusMatch} onBack={() => goTo("landing")} />}
      {view === "player" && !authed && <AuthScreen role="player" onAuth={() => setAuthed(true)} onBack={() => goTo("landing")} />}
      {view === "player" && authed && !selectedComp && <PlayerCompList onSelect={setSelectedComp} onBack={() => goTo("landing")} />}
      {view === "player" && authed && selectedComp && !checkedIn && <CheckIn onCheckIn={() => setCheckedIn(true)} onBack={() => setSelectedComp(null)} comp={selectedComp} />}
      {view === "player" && authed && selectedComp && checkedIn && <PlayerLive matches={matches} onViewMatch={(id) => { setFocusMatch(id); setView("spectator"); setAuthed(true); }} onBack={() => setCheckedIn(false)} />}
      {view === "referee" && !authed && <AuthScreen role="referee" onAuth={() => setAuthed(true)} onBack={() => goTo("landing")} />}
      {view === "referee" && authed && <RefereeFlow match={matches.find(m => m.id === 1)} scorePoint={scorePoint} undoPoint={undoPoint} startNextGame={startNextGame} scoreFlash={scoreFlash} onBack={() => goTo("landing")} />}
      {view === "organizer" && !authed && <AuthScreen role="organizer" onAuth={() => setAuthed(true)} onBack={() => goTo("landing")} />}
      {view === "organizer" && authed && !selectedComp && <OrgCompList onSelect={setSelectedComp} onBack={() => goTo("landing")} competitions={orgComps} onCreateEvent={() => setView("org_create_event")} />}
      {view === "org_create_event" && <CreateEvent onSubmit={(event) => { setOrgComps(prev => [...prev, event]); setView("organizer"); setAuthed(true); }} onBack={() => { setView("organizer"); setAuthed(true); }} />}
      {view === "organizer" && authed && selectedComp && !selectedCategory && <CategoryList comp={selectedComp} onSelect={setSelectedCategory} onBack={() => setSelectedComp(null)} />}
      {view === "organizer" && authed && selectedComp && selectedCategory && <OrgDashboard matches={matches} category={selectedCategory} comp={selectedComp} onBack={() => setSelectedCategory(null)} />}
    </div>
  );
}

// ══════════════════════════════════════
// LANDING
// ══════════════════════════════════════
function Landing({ onSelect }) {
  const roles = [
    { key: "spectator", icon: "👀", label: "Spectator", desc: "Watch live scores — no account needed", colors: COLORS.spectator, auth: "5-digit code" },
    { key: "player", icon: "🏓", label: "Player", desc: "Check in, view matches & submit scores", colors: COLORS.player, auth: "Email / Google" },
    { key: "referee", icon: "🏁", label: "Referee", desc: "Score matches point-by-point in real time", colors: COLORS.referee, auth: "Email / Google" },
    { key: "organizer", icon: "📋", label: "Organizer", desc: "Create events, manage referees & courts", colors: COLORS.organizer, auth: "Email / Google" },
  ];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(170deg, #0A0F1A 0%, #111827 50%, #0A0F1A 100%)", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 25% 15%, rgba(168,85,247,0.06) 0%, transparent 50%), radial-gradient(ellipse at 75% 85%, rgba(239,68,68,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 440, width: "100%" }}>
        {/* <div style={{ fontSize: 15, fontFamily: "JetBrains Mono", color: "#94A3B8", letterSpacing: 3, marginBottom: 8 }}>INTERACTIVE PROTOTYPE</div> */}
        <h1 className="pp-landing-title" style={{ fontFamily: "Outfit", fontSize: 52, fontWeight: 800, margin: "0 0 8px", background: "linear-gradient(135deg, #FFF 30%, #94A3B8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PicklePoint</h1>
        {/* <div style={{ fontSize: 16, color: "#94A3B8", fontFamily: "JetBrains Mono", marginBottom: 40 }}>Real-time tournament management</div> */}
        {/* <div style={{ textAlign: "left", fontSize: 14, color: "#94A3B8", fontFamily: "JetBrains Mono", letterSpacing: 2, marginBottom: 12, paddingLeft: 4 }}>SELECT YOUR ROLE</div> */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {roles.map((r, i) => (
            <button key={r.key} onClick={() => onSelect(r.key)} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
              background: "rgba(255,255,255,0.02)", border: `1px solid ${r.colors.border}`,
              borderRadius: 14, cursor: "pointer", color: "#E8ECF4", textAlign: "left",
              transition: "all 0.2s", animation: `fadeIn 0.4s ease ${i * 0.08}s both`
            }}
              onMouseEnter={e => { e.currentTarget.style.background = r.colors.bg; e.currentTarget.style.transform = "translateX(4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: 28, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: r.colors.bg, borderRadius: 10, border: `1px solid ${r.colors.border}`, flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 19, color: r.colors.primary }}>{r.label}</div>
                <div style={{ fontSize: 15, color: "#94A3B8", marginTop: 1 }}>{r.desc}</div>
              </div>
              <div style={{ fontSize: 13, fontFamily: "JetBrains Mono", color: "#94A3B8", background: "rgba(255,255,255,0.04)", padding: "5px 10px", borderRadius: 6, flexShrink: 0 }}>{r.auth}</div>
            </button>
          ))}
        </div>
        {/* <div style={{ marginTop: 28, fontSize: 14, color: "#64748B", fontFamily: "JetBrains Mono" }}>↑ increasing permissions ↓</div> */}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// SPECTATOR AUTH
// ══════════════════════════════════════
function SpectatorAuth({ onAuth, onBack }) {
  const [code, setCode] = useState(""); const [captcha, setCaptcha] = useState(""); const [error, setError] = useState("");
  const submit = () => { if (code.length !== 5) { setError("Enter a 5-digit code"); return; } if (captcha !== "7") { setError("Incorrect captcha"); return; } onAuth(); };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0A0F1A" }}>
      <TopBar onBack={onBack} title="Spectator Access" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 360, width: "100%", animation: "slideUp 0.4s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}><div style={{ fontSize: 44, marginBottom: 12 }}>👀</div><div style={{ fontFamily: "Outfit", fontSize: 25, fontWeight: 700 }}>Watch Live Scores</div><div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4 }}>Enter the tournament code to view</div></div>
          <label style={{ display: "block", fontSize: 15, fontFamily: "JetBrains Mono", color: "#94A3B8", marginBottom: 6 }}>TOURNAMENT CODE</label>
          <input value={code} onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 5)); setError(""); }} placeholder="00000" style={{ width: "100%", padding: "16px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 10, color: "#E8ECF4", fontSize: 28, fontFamily: "JetBrains Mono", textAlign: "center", letterSpacing: 8, outline: "none", marginBottom: 16 }} />
          <label style={{ display: "block", fontSize: 15, fontFamily: "JetBrains Mono", color: "#94A3B8", marginBottom: 6 }}>VERIFY YOU'RE HUMAN</label>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#94A3B8" }}>What is 4 + 3?</div>
            <input value={captcha} onChange={e => { setCaptcha(e.target.value); setError(""); }} placeholder="Answer" style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8, color: "#E8ECF4", fontSize: 19, outline: "none" }} />
          </div>
          {error && <div style={{ color: "#EF4444", fontSize: 16, marginBottom: 12, textAlign: "center" }}>{error}</div>}
          <button onClick={submit} style={{ width: "100%", padding: 16, background: COLORS.spectator.gradient, border: "none", borderRadius: 10, color: "#0A0F1A", fontFamily: "Outfit", fontWeight: 700, fontSize: 19, cursor: "pointer" }}>View Live Scores →</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// AUTH SCREEN
// ══════════════════════════════════════
function AuthScreen({ role, onAuth, onBack }) {
  const [mode, setMode] = useState("login");
  const cc = COLORS[role]; const icons = { player: "🏓", referee: "🏁", organizer: "📋" }; const labels = { player: "Player", referee: "Referee", organizer: "Organizer" };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0A0F1A" }}>
      <TopBar onBack={onBack} title={`${labels[role]} ${mode === "login" ? "Login" : "Sign Up"}`} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 360, width: "100%", animation: "slideUp 0.4s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}><div style={{ fontSize: 44, marginBottom: 12 }}>{icons[role]}</div><div style={{ fontFamily: "Outfit", fontSize: 25, fontWeight: 700, color: cc.primary }}>{labels[role]} {mode === "login" ? "Login" : "Sign Up"}</div></div>
          <button onClick={onAuth} style={{ width: "100%", padding: 15, background: "#FFF", border: "none", borderRadius: 10, color: "#1F2937", fontFamily: "DM Sans", fontWeight: 600, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}><div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} /><span style={{ fontSize: 15, color: "#94A3B8" }}>or</span><div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} /></div>
          <label style={{ display: "block", fontSize: 15, fontFamily: "JetBrains Mono", color: "#94A3B8", marginBottom: 6 }}>EMAIL</label>
          <input placeholder="you@email.com" type="email" style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${cc.border}`, borderRadius: 10, color: "#E8ECF4", fontSize: 18, outline: "none", marginBottom: 12 }} />
          <label style={{ display: "block", fontSize: 15, fontFamily: "JetBrains Mono", color: "#94A3B8", marginBottom: 6 }}>PASSWORD</label>
          <input placeholder="••••••••" type="password" style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${cc.border}`, borderRadius: 10, color: "#E8ECF4", fontSize: 18, outline: "none", marginBottom: 20 }} />
          <button onClick={onAuth} style={{ width: "100%", padding: 15, background: cc.gradient, border: "none", borderRadius: 10, color: "#0A0F1A", fontFamily: "Outfit", fontWeight: 700, fontSize: 19, cursor: "pointer" }}>{mode === "login" ? "Log In" : "Create Account"} →</button>
          <div style={{ textAlign: "center", marginTop: 16 }}><button onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ background: "none", border: "none", color: cc.primary, cursor: "pointer", fontSize: 16 }}>{mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}</button></div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// PLAYER: COMPETITIONS + FIND
// ══════════════════════════════════════
function PlayerCompList({ onSelect, onBack }) {
  const [tab, setTab] = useState("mine");
  const [search, setSearch] = useState("");
  const [filterFee, setFilterFee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = DISCOVER_COMPETITIONS.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.venue.toLowerCase().includes(search.toLowerCase()) && !c.organizer.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterFee === "free" && c.fee !== "Free") return false;
    if (filterFee === "paid" && c.fee === "Free") return false;
    if (filterStatus === "open" && c.status !== "registration") return false;
    if (filterStatus === "full" && c.status !== "full") return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1A" }}>
      <TopBar onBack={onBack} title="Competitions" />
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {["mine", "find"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "11px 0", background: "none", border: "none",
            borderBottom: tab === t ? `2px solid ${COLORS.player.primary}` : "2px solid transparent",
            color: tab === t ? "#E8ECF4" : "#94A3B8", fontFamily: "DM Sans", fontWeight: 600, fontSize: 16, cursor: "pointer"
          }}>{t === "mine" ? "My Competitions" : "Find Competitions"}</button>
        ))}
      </div>
      <div style={{ padding: 14 }}>
        {tab === "mine" ? (
          <>
            <div style={{ fontSize: 14, fontFamily: "JetBrains Mono", color: "#94A3B8", letterSpacing: 2, marginBottom: 10 }}>REGISTERED</div>
            {COMPETITIONS.map((comp, i) => (
              <button key={comp.id} onClick={() => onSelect(comp)} style={{
                width: "100%", padding: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${COLORS.player.border}`,
                borderRadius: 14, marginBottom: 10, cursor: "pointer", color: "#E8ECF4", textAlign: "left", transition: "all 0.2s", animation: `fadeIn 0.3s ease ${i * 0.1}s both`
              }}
                onMouseEnter={e => { e.currentTarget.style.background = COLORS.player.bg; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 19 }}>{comp.name}</span>
                      <Badge text="LIVE" color="#22C55E" bg="rgba(34,197,94,0.15)" />
                    </div>
                    <div style={{ fontSize: 16, color: "#94A3B8" }}>{comp.date} · {comp.venue}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>{comp.categories.map(cat => <Badge key={cat} text={cat} color={COLORS.player.primary} bg={COLORS.player.bg} />)}</div>
                  </div>
                  <span style={{ color: "#94A3B8", fontSize: 18 }}>→</span>
                </div>
              </button>
            ))}
          </>
        ) : (
          <>
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 16 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search competitions, venues, organizers..." style={{
                width: "100%", padding: "13px 16px 13px 40px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: 10, color: "#E8ECF4", fontSize: 17, outline: "none"
              }} />
            </div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              <Chip label="All" active={filterStatus === "all"} onClick={() => setFilterStatus("all")} color={COLORS.player.primary} />
              <Chip label="Open" active={filterStatus === "open"} onClick={() => setFilterStatus("open")} color="#22C55E" />
              <Chip label="Full" active={filterStatus === "full"} onClick={() => setFilterStatus("full")} color="#F59E0B" />
              <div style={{ width: 1, background: "rgba(255,255,255,0.06)", margin: "0 4px" }} />
              <Chip label="Any Fee" active={filterFee === "all"} onClick={() => setFilterFee("all")} color={COLORS.player.primary} />
              <Chip label="Free" active={filterFee === "free"} onClick={() => setFilterFee("free")} color="#22C55E" />
              <Chip label="Paid" active={filterFee === "paid"} onClick={() => setFilterFee("paid")} color="#F59E0B" />
            </div>
            <div style={{ fontSize: 14, fontFamily: "JetBrains Mono", color: "#94A3B8", letterSpacing: 2, marginBottom: 10 }}>{filtered.length} COMPETITIONS FOUND</div>
            {filtered.map((comp, i) => (
              <div key={comp.id} style={{
                padding: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, marginBottom: 10, animation: `fadeIn 0.3s ease ${i * 0.06}s both`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 18, color: "#E8ECF4" }}>{comp.name}</span>
                      <Badge text={comp.status === "full" ? "FULL" : "OPEN"} color={comp.status === "full" ? "#F59E0B" : "#22C55E"} bg={comp.status === "full" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)"} />
                    </div>
                    <div style={{ fontSize: 15, color: "#94A3B8" }}>{comp.date} · {comp.venue}</div>
                    <div style={{ fontSize: 15, color: "#94A3B8", marginTop: 2 }}>by {comp.organizer}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>{comp.categories.map(cat => <Badge key={cat} text={cat} color="#94A3B8" bg="rgba(255,255,255,0.04)" />)}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 19, color: COLORS.player.primary }}>{comp.fee}</div>
                    <div style={{ fontSize: 13, fontFamily: "JetBrains Mono", color: "#94A3B8", marginTop: 2 }}>{comp.playerCount}/{comp.maxPlayers}</div>
                    {comp.status === "registration" && (
                      <button style={{ marginTop: 8, padding: "8px 16px", background: COLORS.player.gradient, border: "none", borderRadius: 8, color: "white", fontSize: 15, fontFamily: "Outfit", fontWeight: 600, cursor: "pointer" }}>Register</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// PLAYER: QR CHECK-IN (Organizer scans player)
// ══════════════════════════════════════
function CheckIn({ onCheckIn, onBack, comp }) {
  const [waiting, setWaiting] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1A" }}>
      <TopBar onBack={onBack} title="Check In" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, paddingTop: 48 }}>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center", animation: "slideUp 0.4s ease" }}>
          <div style={{ fontFamily: "Outfit", fontSize: 23, fontWeight: 700, marginBottom: 4 }}>{comp.name}</div>
          <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 28 }}>{comp.date} · {comp.venue}</div>
          {!waiting ? (
            <>
              <div style={{ fontSize: 15, fontFamily: "JetBrains Mono", color: "#94A3B8", letterSpacing: 2, marginBottom: 16 }}>SHOW THIS TO THE ORGANIZER</div>
              {/* Simulated QR Code */}
              <div style={{
                width: 220, height: 220, margin: "0 auto 8px", borderRadius: 16,
                border: "2px solid rgba(239,68,68,0.25)", background: "#FFFFFF", padding: 16,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gridTemplateRows: "repeat(9, 1fr)", gap: 2 }}>
                  {Array.from({ length: 81 }).map((_, i) => {
                    const row = Math.floor(i / 9); const col = i % 9;
                    const isCorner = (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3);
                    const isFill = isCorner || Math.random() > 0.45;
                    return <div key={i} style={{ background: isFill ? "#1a1a2e" : "#FFFFFF", borderRadius: 1 }} />;
                  })}
                </div>
              </div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 21, letterSpacing: 4, color: "#E8ECF4", marginBottom: 4 }}>PB-83472-ASM</div>
              <div style={{ fontSize: 15, color: "#94A3B8", marginBottom: 24 }}>Your unique check-in code</div>
              <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: 16, marginBottom: 20, textAlign: "left" }}>
                <div style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700, color: COLORS.player.primary }}>How it works:</span> Present this QR code to the tournament organizer at the check-in desk. They will scan it to verify your physical presence and confirm your check-in.
                </div>
              </div>
              <button onClick={() => setWaiting(true)} style={{
                width: "100%", padding: 16, background: COLORS.player.gradient, border: "none",
                borderRadius: 10, color: "white", fontFamily: "Outfit", fontWeight: 700, fontSize: 19, cursor: "pointer"
              }}>I'm at the Venue — Waiting for Scan</button>
            </>
          ) : (
            <>
              <div style={{
                width: 220, height: 220, margin: "0 auto 16px", borderRadius: 16,
                border: "2px solid rgba(239,68,68,0.3)", background: "#FFFFFF", padding: 16,
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden"
              }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.04)" }} />
                <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gridTemplateRows: "repeat(9, 1fr)", gap: 2, opacity: 0.3 }}>
                  {Array.from({ length: 81 }).map((_, i) => <div key={i} style={{ background: Math.random() > 0.45 ? "#1a1a2e" : "#FFF", borderRadius: 1 }} />)}
                </div>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: COLORS.player.primary, animation: "scanLine 2s ease-in-out infinite" }} />
              </div>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 16, color: COLORS.player.primary, marginBottom: 8, animation: "pulse 2s infinite" }}>Waiting for organizer to scan...</div>
              <div style={{ fontSize: 15, color: "#94A3B8", marginBottom: 24 }}>Show your screen to the check-in desk</div>
              <button onClick={onCheckIn} style={{
                width: "100%", padding: 16, background: "linear-gradient(135deg, #22C55E, #16A34A)", border: "none",
                borderRadius: 10, color: "white", fontFamily: "Outfit", fontWeight: 700, fontSize: 19, cursor: "pointer"
              }}>✓ Simulate Organizer Scan</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// SPECTATOR LIVE
// ══════════════════════════════════════
function SpectatorLive({ matches, focusMatch, setFocusMatch, onBack }) {
  const active = matches.filter(m => m.status !== "scheduled");
  if (focusMatch !== null) { const m = matches.find(x => x.id === focusMatch); if (!m) { setFocusMatch(null); return null; } return <MatchFocus match={m} onBack={() => setFocusMatch(null)} />; }
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1A" }}>
      <TopBar onBack={onBack} title="Live Scores" right={<div style={{ display: "flex", alignItems: "center", gap: 5 }}><LiveDot /><span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "#22C55E" }}>LIVE</span></div>} />
      <div className="pp-court-grid" style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {active.map((m, i) => {
          const done = m.status === "completed" || m.status === "match_end"; const isRef = m.scoredBy === "referee";
          return (
            <button key={m.id} onClick={() => setFocusMatch(m.id)} style={{
              background: done ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)", border: done ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: 16, cursor: "pointer", color: "#E8ECF4", textAlign: "left", transition: "all 0.2s", animation: `fadeIn 0.3s ease ${i * 0.05}s both`
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = done ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Badge text={`Court ${m.court}`} color={done ? "#94A3B8" : "#22C55E"} bg={done ? "rgba(255,255,255,0.05)" : "rgba(34,197,94,0.15)"} /><span style={{ fontSize: 13, color: "#94A3B8", fontFamily: "JetBrains Mono" }}>{m.round}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>{isRef && !done && <LiveDot />}<span style={{ fontSize: 13, fontFamily: "JetBrains Mono", color: done ? "#94A3B8" : isRef ? "#22C55E" : "#94A3B8" }}>{done ? "FINAL" : isRef ? "LIVE" : "IN PROGRESS"}</span></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 500, color: "#94A3B8", marginBottom: 2 }}>{teamDisplay(m.teamA, true)}</div><div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 36, color: done ? (m.matchScore.a > m.matchScore.b ? "#22C55E" : "#94A3B8") : "#60A5FA" }}>{done || !isRef ? m.matchScore.a : m.currentGame.a}</div></div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 16, color: "#64748B", margin: "0 8px", marginTop: 16 }}>vs</div>
                <div style={{ flex: 1, textAlign: "right" }}><div style={{ fontSize: 15, fontWeight: 500, color: "#94A3B8", marginBottom: 2 }}>{teamDisplay(m.teamB, true)}</div><div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 36, color: done ? (m.matchScore.b > m.matchScore.a ? "#22C55E" : "#94A3B8") : "#F87171" }}>{done || !isRef ? m.matchScore.b : m.currentGame.b}</div></div>
              </div>
              {!done && <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 13, fontFamily: "JetBrains Mono", color: "#94A3B8" }}>{isRef ? "🏁 Referee · point-by-point" : "🏓 Player scoring · per game"}{!isRef && ` · Match: ${m.matchScore.a}-${m.matchScore.b}`}</div>}
              {m.games.length > 0 && <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 6, justifyContent: "center" }}>{m.games.map((g, j) => <span key={j} style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "#94A3B8", background: "rgba(255,255,255,0.03)", padding: "3px 10px", borderRadius: 4 }}>G{j + 1}: {g.a}-{g.b}</span>)}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchFocus({ match: m, onBack }) {
  const isRef = m.scoredBy === "referee"; const done = m.status === "completed" || m.status === "match_end";
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1A", display: "flex", flexDirection: "column" }}>
      <TopBar onBack={onBack} title={`Court ${m.court}`} right={<div style={{ display: "flex", alignItems: "center", gap: 5 }}>{!done && <LiveDot color={isRef ? "#22C55E" : "#94A3B8"} />}<span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: done ? "#94A3B8" : "#22C55E" }}>{done ? "FINAL" : "LIVE"}</span></div>} />
      <div style={{ textAlign: "center", padding: "10px 0 0" }}>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: "#94A3B8" }}>{m.division} · {m.round}</div>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: "#94A3B8", marginTop: 2 }}>{isRef ? "🏁 Referee · point-by-point" : "🏓 Player scoring · game-by-game"}</div>
        {!done && <div style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: "#94A3B8", marginTop: 2 }}>Game {m.gameNum}/3 | Match: {m.matchScore.a}-{m.matchScore.b}</div>}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: "#94A3B8" }}>{teamDisplay(m.teamA)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div className="pp-score-focus" style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: 88, color: "#60A5FA", lineHeight: 1 }}>{done || !isRef ? m.matchScore.a : m.currentGame.a}</div>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 21, color: "#64748B" }}>:</div>
          <div className="pp-score-focus" style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: 88, color: "#F87171", lineHeight: 1 }}>{done || !isRef ? m.matchScore.b : m.currentGame.b}</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, color: "#94A3B8" }}>{teamDisplay(m.teamB)}</div>
        {!isRef && !done && <div style={{ marginTop: 8, padding: "8px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, fontFamily: "JetBrains Mono", fontSize: 14, color: "#94A3B8" }}>Updates when each game ends</div>}
      </div>
      {m.games.length > 0 && <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}><div style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "#94A3B8", marginBottom: 8, textAlign: "center" }}>GAME HISTORY</div><div style={{ display: "flex", gap: 8, justifyContent: "center" }}>{m.games.map((g, i) => <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 18px", textAlign: "center" }}><div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>GAME {i + 1}</div><div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 21 }}><span style={{ color: g.a > g.b ? "#22C55E" : "#94A3B8" }}>{g.a}</span><span style={{ color: "#64748B" }}> - </span><span style={{ color: g.b > g.a ? "#22C55E" : "#94A3B8" }}>{g.b}</span></div></div>)}</div></div>}
    </div>
  );
}

// ══════════════════════════════════════
// PLAYER LIVE
// ══════════════════════════════════════
function PlayerLive({ matches, onViewMatch, onBack }) {
  const active = matches.filter(m => m.status === "active");
  const [scoreStep, setScoreStep] = useState("idle");
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const playerMatch = matches.find(m => m.id === 4);
  const gameNum = playerMatch?.gameNum || 1;

  const numA = parseInt(scoreA) || 0;
  const numB = parseInt(scoreB) || 0;
  const bothFilled = scoreA !== "" && scoreB !== "";
  const atLeast11 = numA >= 11 || numB >= 11;
  const winBy2 = Math.abs(numA - numB) >= 2;
  const isValid = bothFilled && atLeast11 && winBy2 && numA !== numB;

  const handleReset = () => { setScoreStep("idle"); setScoreA(""); setScoreB(""); };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1A" }}>
      <TopBar onBack={onBack} title="My Tournament" right={<span style={{ fontSize: 21, cursor: "pointer" }}>🔔</span>} />
      <div style={{ padding: 14 }}>
        {scoreStep === "idle" && (
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 14, padding: 18, marginBottom: 12 }}>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "#F59E0B", letterSpacing: 2, marginBottom: 6 }}>SUBMIT GAME SCORE</div>
          <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 4 }}>Court 4 · SF-2 · Patel/Lee vs Martin/Clark</div>
          <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 10 }}>No referee — submit final game scores</div>
          <button onClick={() => setScoreStep("enter")} style={{ width: "100%", padding: 12, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, color: "#F59E0B", fontFamily: "Outfit", fontWeight: 600, fontSize: 17, cursor: "pointer" }}>Enter Game {gameNum} Score →</button>
        </div>
        )}

        {scoreStep === "enter" && (
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 14, padding: 18, marginBottom: 12, animation: "slideUp 0.3s ease" }}>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "#F59E0B", letterSpacing: 2, marginBottom: 6 }}>ENTER GAME {gameNum} SCORE</div>
          <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 16 }}>Court 4 · SF-2 · Patel/Lee vs Martin/Clark</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: "#E8ECF4" }}>Patel / Lee</div>
              <input type="number" min="0" value={scoreA} onChange={e => setScoreA(e.target.value)} placeholder="0" style={{ width: 80, padding: "10px 8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, color: "#E8ECF4", fontFamily: "Outfit", fontWeight: 800, fontSize: 40, textAlign: "center", outline: "none" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: "#E8ECF4" }}>Martin / Clark</div>
              <input type="number" min="0" value={scoreB} onChange={e => setScoreB(e.target.value)} placeholder="0" style={{ width: 80, padding: "10px 8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, color: "#E8ECF4", fontFamily: "Outfit", fontWeight: 800, fontSize: 40, textAlign: "center", outline: "none" }} />
            </div>
          </div>
          {bothFilled && !isValid && (
            <div style={{ fontSize: 14, color: "#F87171", marginBottom: 12, fontFamily: "DM Sans" }}>
              {!atLeast11 ? "At least one team must score 11 or more" : !winBy2 ? "Winner must lead by at least 2 points" : numA === numB ? "Scores cannot be tied" : ""}
            </div>
          )}
          <button onClick={() => isValid && setScoreStep("waiting")} disabled={!isValid} style={{ width: "100%", padding: 14, background: isValid ? "linear-gradient(135deg, #D97706, #F59E0B)" : "rgba(245,158,11,0.1)", border: "none", borderRadius: 10, color: isValid ? "white" : "rgba(245,158,11,0.4)", fontFamily: "Outfit", fontWeight: 700, fontSize: 17, cursor: isValid ? "pointer" : "not-allowed", transition: "all 0.2s" }}>Submit for Verification →</button>
          <button onClick={handleReset} style={{ width: "100%", padding: 10, background: "none", border: "none", color: "#94A3B8", fontFamily: "DM Sans", fontSize: 15, cursor: "pointer", marginTop: 8 }}>Cancel</button>
        </div>
        )}

        {scoreStep === "waiting" && (
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 14, padding: 18, marginBottom: 12, textAlign: "center", animation: "slideUp 0.3s ease" }}>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "#F59E0B", letterSpacing: 2, marginBottom: 12, animation: "pulse 2s infinite" }}>AWAITING OPPONENT VERIFICATION</div>
          <div style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: 52, color: "#E8ECF4", marginBottom: 4 }}>{scoreA} <span style={{ color: "#64748B", fontSize: 32 }}>-</span> {scoreB}</div>
          <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 20 }}>Patel/Lee vs Martin/Clark</div>
          <div style={{
            width: 200, height: 200, margin: "0 auto 8px", borderRadius: 16,
            border: "2px solid rgba(245,158,11,0.25)", background: "#FFFFFF", padding: 16,
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden"
          }}>
            <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gridTemplateRows: "repeat(9, 1fr)", gap: 2 }}>
              {Array.from({ length: 81 }).map((_, i) => {
                const row = Math.floor(i / 9); const col = i % 9;
                const isCorner = (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3);
                const isFill = isCorner || Math.random() > 0.45;
                return <div key={i} style={{ background: isFill ? "#1a1a2e" : "#FFFFFF", borderRadius: 1 }} />;
              })}
            </div>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#F59E0B", animation: "scanLine 2s ease-in-out infinite" }} />
          </div>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 19, letterSpacing: 4, color: "#E8ECF4", marginBottom: 4 }}>VS-48291-G{gameNum}</div>
          <div style={{ fontSize: 15, color: "#94A3B8", marginBottom: 20 }}>Show this QR code to your opponent. They must scan it to confirm the score.</div>
          <button onClick={() => setScoreStep("verified")} style={{
            width: "100%", padding: 14, background: "linear-gradient(135deg, #22C55E, #16A34A)", border: "none",
            borderRadius: 10, color: "white", fontFamily: "Outfit", fontWeight: 700, fontSize: 17, cursor: "pointer"
          }}>✓ Simulate Opponent Verification</button>
          <button onClick={handleReset} style={{ width: "100%", padding: 10, background: "none", border: "none", color: "#94A3B8", fontFamily: "DM Sans", fontSize: 15, cursor: "pointer", marginTop: 8 }}>Cancel</button>
        </div>
        )}

        {scoreStep === "verified" && (
        <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: 24, marginBottom: 12, textAlign: "center", animation: "slideUp 0.3s ease" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✓</div>
          <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 22, color: "#22C55E", marginBottom: 8 }}>Score Verified & Submitted</div>
          <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 44, color: "#E8ECF4", marginBottom: 4 }}>{scoreA} <span style={{ color: "#64748B", fontSize: 28 }}>-</span> {scoreB}</div>
          <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 6 }}>Patel/Lee vs Martin/Clark · Game {gameNum}</div>
          <div style={{ fontSize: 15, color: "#94A3B8", marginBottom: 20 }}>Both parties confirmed — score is official</div>
          <button onClick={handleReset} style={{
            width: "100%", padding: 14, background: "linear-gradient(135deg, #22C55E, #16A34A)", border: "none",
            borderRadius: 10, color: "white", fontFamily: "Outfit", fontWeight: 700, fontSize: 17, cursor: "pointer"
          }}>Done</button>
        </div>
        )}
        <div style={{ fontSize: 13, fontFamily: "JetBrains Mono", color: "#94A3B8", letterSpacing: 2, marginBottom: 8 }}>LIVE ACROSS TOURNAMENT</div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
          {active.map(m => (
            <button key={m.id} onClick={() => onViewMatch(m.id)} style={{ minWidth: 160, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px", cursor: "pointer", color: "#E8ECF4", textAlign: "left", flexShrink: 0 }}>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: m.scoredBy === "referee" ? "#22C55E" : "#94A3B8", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>{m.scoredBy === "referee" && <LiveDot />}Ct {m.court}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#94A3B8" }}><span>{teamDisplay(m.teamA, true)}</span><span style={{ fontFamily: "Outfit", fontWeight: 700, color: "#60A5FA" }}>{m.scoredBy === "referee" ? m.currentGame.a : m.matchScore.a}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#94A3B8", marginTop: 2 }}><span>{teamDisplay(m.teamB, true)}</span><span style={{ fontFamily: "Outfit", fontWeight: 700, color: "#F87171" }}>{m.scoredBy === "referee" ? m.currentGame.b : m.matchScore.b}</span></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// REFEREE
// ══════════════════════════════════════
function RefereeFlow({ match, scorePoint, undoPoint, startNextGame, scoreFlash, onBack }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { if (!match) return; const i = setInterval(() => setElapsed(Date.now() - match.startedAt), 1000); return () => clearInterval(i); }, [match?.startedAt]);
  if (!match) return null;
  const isGE = match.status === "game_end"; const isME = match.status === "match_end";
  const isMP = (match.currentGame.a >= 10 || match.currentGame.b >= 10) && Math.abs(match.currentGame.a - match.currentGame.b) >= 1 && match.status === "active";
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0A0F1A" }}>
      <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(234,179,8,0.15)", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 17 }}>← Back</button>
        <div style={{ textAlign: "center" }}><div style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: COLORS.referee.primary, letterSpacing: 2 }}>COURT 1 · LIVE SCORING</div><div style={{ fontSize: 14, color: "#94A3B8" }}>{match.division} — {match.round}</div></div>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, color: "#94A3B8" }}>{formatTime(elapsed)}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "8px 0", background: "rgba(234,179,8,0.04)", flexShrink: 0 }}>
        <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: "#94A3B8" }}>Game {match.gameNum}/3</span><span style={{ color: "rgba(255,255,255,0.1)" }}>|</span><span style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: "#94A3B8" }}>Match: {match.matchScore.a}-{match.matchScore.b}</span>
        {match.games.length > 0 && <><span style={{ color: "rgba(255,255,255,0.1)" }}>|</span><span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "#94A3B8" }}>{match.games.map((g, i) => `G${i + 1}: ${g.a}-${g.b}`).join("  ")}</span></>}
      </div>
      {isMP && <div style={{ padding: 7, textAlign: "center", fontFamily: "Outfit", fontWeight: 700, fontSize: 15, background: "linear-gradient(90deg, transparent, rgba(234,179,8,0.2), transparent)", color: COLORS.referee.primary, letterSpacing: 2, animation: "pulse 1.5s infinite", flexShrink: 0 }}>⚡ {match.matchScore[match.currentGame.a > match.currentGame.b ? "a" : "b"] === 1 ? "MATCH" : "GAME"} POINT</div>}
      {match.status === "active" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, padding: 3, minHeight: 0 }}>
          {["a", "b"].map(t => (
            <button key={t} onClick={() => scorePoint(match.id, t)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: scoreFlash === t ? (t === "a" ? "rgba(96,165,250,0.2)" : "rgba(248,113,113,0.2)") : (t === "a" ? "rgba(96,165,250,0.06)" : "rgba(248,113,113,0.06)"),
              border: `2px solid ${t === "a" ? "rgba(96,165,250,0.2)" : "rgba(248,113,113,0.2)"}`, borderRadius: 16, cursor: "pointer", color: "#E8ECF4", transition: "all 0.12s", position: "relative"
            }}>
              <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 6 }}>{teamDisplay(match[t === "a" ? "teamA" : "teamB"])}</div>
              <div className="pp-score-big" style={{ fontFamily: "Outfit", fontWeight: 900, fontSize: 88, lineHeight: 1, color: t === "a" ? "#60A5FA" : "#F87171", transition: "transform 0.12s", transform: scoreFlash === t ? "scale(1.06)" : "scale(1)" }}>{match.currentGame[t]}</div>
              <div style={{ position: "absolute", bottom: 14, fontSize: 14, color: "#94A3B8", fontFamily: "JetBrains Mono" }}>TAP TO SCORE</div>
            </button>
          ))}
        </div>
      ) : isGE ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, animation: "slideUp 0.3s ease" }}>
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 16, color: "#22C55E", letterSpacing: 2 }}>GAME {match.gameNum} COMPLETE</div>
          <div style={{ fontFamily: "Outfit", fontSize: 60, fontWeight: 800 }}>{match.currentGame.a} - {match.currentGame.b}</div>
          <button onClick={() => startNextGame(match.id)} style={{ padding: "16px 48px", background: "linear-gradient(135deg, #22C55E, #16A34A)", border: "none", borderRadius: 12, color: "white", fontFamily: "Outfit", fontWeight: 700, fontSize: 20, cursor: "pointer" }}>Start Game {match.gameNum + 1} →</button>
        </div>
      ) : isME ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, animation: "slideUp 0.3s ease" }}>
          <div style={{ fontSize: 18, color: COLORS.referee.primary, fontFamily: "JetBrains Mono", letterSpacing: 3 }}>🏆 MATCH COMPLETE</div>
          <div style={{ fontFamily: "Outfit", fontSize: 25, fontWeight: 600, color: "#94A3B8" }}>{teamDisplay(match.matchScore.a > match.matchScore.b ? match.teamA : match.teamB)} wins</div>
          <div style={{ fontFamily: "Outfit", fontSize: 48, fontWeight: 800 }}>{match.matchScore.a} - {match.matchScore.b}</div>
          <button onClick={onBack} style={{ padding: "16px 48px", background: COLORS.referee.gradient, border: "none", borderRadius: 12, color: "#0A0F1A", fontFamily: "Outfit", fontWeight: 700, fontSize: 19, cursor: "pointer" }}>Submit Result ✓</button>
        </div>
      ) : null}
      {match.status === "active" && <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "center", flexShrink: 0 }}><button onClick={undoPoint} style={{ padding: "12px 32px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#94A3B8", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>↩ Undo Last Point</button></div>}
    </div>
  );
}

// ══════════════════════════════════════
// ORGANIZER: CREATE EVENT
// ══════════════════════════════════════
const EVENT_CATEGORIES = ["Mixed Doubles", "Men's Doubles", "Women's Doubles", "Men's Singles", "Women's Singles", "Open Singles", "Open Doubles", "Pro Doubles", "Corporate Doubles"];

function CreateEvent({ onSubmit, onBack }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [caps, setCaps] = useState({});

  const toggleCat = (cat) => {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    if (!caps[cat]) setCaps(prev => ({ ...prev, [cat]: 32 }));
  };

  const handleSubmit = () => {
    if (!name || !date || !venue || selectedCats.length === 0) return;
    onSubmit({
      id: "comp_" + Date.now(),
      name,
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      venue,
      categories: selectedCats,
      playerCount: 0,
      maxPlayers: selectedCats.reduce((sum, cat) => sum + (caps[cat] || 32), 0),
      status: "registration",
    });
  };

  const cc = COLORS.organizer;
  const inputStyle = { width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${cc.border}`, borderRadius: 10, color: "#E8ECF4", fontSize: 17, outline: "none", fontFamily: "DM Sans" };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1A" }}>
      <TopBar onBack={onBack} title="Create Event" />
      <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24, animation: "slideUp 0.4s ease" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>📋</div>
          <div style={{ fontFamily: "Outfit", fontSize: 25, fontWeight: 700, color: cc.primary }}>New Competition</div>
        </div>

        <label style={{ display: "block", fontSize: 14, fontFamily: "JetBrains Mono", color: "#94A3B8", marginBottom: 6 }}>EVENT NAME</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Spring Open 2026" style={{ ...inputStyle, marginBottom: 16 }} />

        <label style={{ display: "block", fontSize: 14, fontFamily: "JetBrains Mono", color: "#94A3B8", marginBottom: 6 }}>DATE</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />

        <label style={{ display: "block", fontSize: 14, fontFamily: "JetBrains Mono", color: "#94A3B8", marginBottom: 6 }}>VENUE</label>
        <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Kallang Sports Hub" style={{ ...inputStyle, marginBottom: 20 }} />

        <label style={{ display: "block", fontSize: 14, fontFamily: "JetBrains Mono", color: "#94A3B8", marginBottom: 10 }}>CATEGORIES</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {EVENT_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => toggleCat(cat)} style={{
              padding: "9px 16px", borderRadius: 20, fontSize: 15, fontFamily: "DM Sans", fontWeight: 600, cursor: "pointer",
              background: selectedCats.includes(cat) ? cc.primary + "22" : "rgba(255,255,255,0.03)",
              border: `1px solid ${selectedCats.includes(cat) ? cc.primary + "55" : "rgba(255,255,255,0.08)"}`,
              color: selectedCats.includes(cat) ? cc.primary : "#94A3B8", transition: "all 0.15s"
            }}>{cat}</button>
          ))}
        </div>

        {selectedCats.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 14, fontFamily: "JetBrains Mono", color: "#94A3B8", marginBottom: 10 }}>PARTICIPANT CAPS</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedCats.map(cat => (
                <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#E8ECF4" }}>{cat}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontFamily: "JetBrains Mono", color: "#94A3B8" }}>Max:</span>
                    <input type="number" value={caps[cat] || 32} onChange={e => setCaps(prev => ({ ...prev, [cat]: parseInt(e.target.value) || 0 }))} min={2} max={256} style={{
                      width: 70, padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: `1px solid ${cc.border}`, borderRadius: 8,
                      color: "#E8ECF4", fontSize: 17, fontFamily: "JetBrains Mono", textAlign: "center", outline: "none"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!name || !date || !venue || selectedCats.length === 0} style={{
          width: "100%", padding: 16, background: (name && date && venue && selectedCats.length > 0) ? cc.gradient : "rgba(255,255,255,0.04)",
          border: "none", borderRadius: 10, color: (name && date && venue && selectedCats.length > 0) ? "#0A0F1A" : "#94A3B8",
          fontFamily: "Outfit", fontWeight: 700, fontSize: 19, cursor: (name && date && venue && selectedCats.length > 0) ? "pointer" : "not-allowed",
          transition: "all 0.2s"
        }}>Create Event →</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ORGANIZER: COMP LIST
// ══════════════════════════════════════
function OrgCompList({ onSelect, onBack, onCreateEvent, competitions }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1A" }}>
      <TopBar onBack={onBack} title="My Events" />
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontFamily: "JetBrains Mono", color: "#94A3B8", letterSpacing: 2, marginBottom: 10 }}>YOUR EVENTS</div>
        {competitions.map((comp, i) => {
          const isReg = comp.status === "registration"; const isLive = comp.status === "live";
          return (
            <button key={comp.id} onClick={() => onSelect(comp)} style={{
              width: "100%", padding: 18, background: isReg ? "rgba(168,85,247,0.02)" : "rgba(255,255,255,0.03)",
              border: isReg ? "1.5px dashed rgba(168,85,247,0.35)" : `1px solid ${COLORS.organizer.border}`,
              borderRadius: 14, marginBottom: 10, cursor: "pointer", color: "#E8ECF4", textAlign: "left", transition: "all 0.2s",
              animation: `fadeIn 0.3s ease ${i * 0.1}s both`
            }}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.organizer.bg; e.currentTarget.style.transform = "translateX(4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = isReg ? "rgba(168,85,247,0.02)" : "rgba(255,255,255,0.03)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 19 }}>{comp.name}</span>
                    {isLive && <Badge text="● LIVE" color="#22C55E" bg="rgba(34,197,94,0.15)" />}
                    {isReg && <Badge text="REGISTRATION" color={COLORS.organizer.primary} bg={COLORS.organizer.bg} />}
                  </div>
                  <div style={{ fontSize: 16, color: "#94A3B8" }}>{comp.date} · {comp.venue}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>{comp.categories.map(cat => <Badge key={cat} text={cat} color={COLORS.organizer.primary} bg={COLORS.organizer.bg} />)}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 23, color: COLORS.organizer.primary }}>{comp.playerCount}{isReg ? `/${comp.maxPlayers}` : ""}</div>
                  <div style={{ fontSize: 13, color: "#94A3B8", fontFamily: "JetBrains Mono" }}>{isReg ? "registered" : "players"}</div>
                </div>
              </div>
            </button>
          );
        })}
        <button onClick={onCreateEvent} style={{ width: "100%", padding: 18, background: "rgba(168,85,247,0.06)", border: "1px dashed rgba(168,85,247,0.3)", borderRadius: 14, cursor: "pointer", color: COLORS.organizer.primary, fontFamily: "Outfit", fontWeight: 600, fontSize: 18, marginTop: 4 }}>+ Create New Competition</button>
      </div>
    </div>
  );
}

function CategoryList({ comp, onSelect, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1A" }}>
      <TopBar onBack={onBack} title={comp.name} right={comp.status === "live" ? <Badge text="● LIVE" color="#22C55E" bg="rgba(34,197,94,0.15)" /> : <Badge text="REG" color={COLORS.organizer.primary} bg={COLORS.organizer.bg} />} />
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, fontFamily: "JetBrains Mono", color: "#94A3B8", letterSpacing: 2, marginBottom: 12 }}>CATEGORIES</div>
        {comp.categories.map((cat, i) => {
          const players = comp.status === "live" ? REGISTERED_PLAYERS.filter(p => p.category === cat) : REG_PHASE_PLAYERS.filter(p => p.category === cat);
          const metric = comp.status === "live" ? `${players.filter(p => p.checkedIn).length} checked in` : `${players.filter(p => p.paymentStatus === "paid").length} paid`;
          return (
            <button key={cat} onClick={() => onSelect(cat)} style={{
              width: "100%", padding: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: 12, marginBottom: 8, cursor: "pointer", color: "#E8ECF4", textAlign: "left",
              display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s", animation: `fadeIn 0.3s ease ${i * 0.08}s both`
            }}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.organizer.bg; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            >
              <div><div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 19 }}>{cat}</div><div style={{ fontSize: 15, color: "#94A3B8", marginTop: 2 }}>{players.length} players · {metric}</div></div>
              <span style={{ color: "#94A3B8", fontSize: 18 }}>→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ORGANIZER DASHBOARD
// ══════════════════════════════════════
function OrgDashboard({ matches, category, comp, onBack }) {
  const [tab, setTab] = useState("courts");
  const isLive = comp.status === "live";
  const catMatches = matches.filter(m => m.division === category);
  const catPlayers = isLive ? REGISTERED_PLAYERS.filter(p => p.category === category) : REG_PHASE_PLAYERS.filter(p => p.category === category);

  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  const companies = [...new Set(catPlayers.map(p => p.company))].sort();

  const filteredPlayers = catPlayers.filter(p => {
    if (isLive) {
      if (statusFilter === "checked_in" && !p.checkedIn) return false;
      if (statusFilter === "not_yet" && p.checkedIn) return false;
    } else {
      if (statusFilter === "paid" && p.paymentStatus !== "paid") return false;
      if (statusFilter === "registered" && p.paymentStatus !== "registered") return false;
    }
    if (companyFilter !== "all" && p.company !== companyFilter) return false;
    return true;
  });

  const tabs = isLive ? ["courts", "queue", "players", "alerts"] : ["players", "alerts"];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1A" }}>
      <TopBar onBack={onBack} title={category} right={isLive ? <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "#22C55E" }}>● LIVE</span> : <Badge text="REG" color={COLORS.organizer.primary} bg={COLORS.organizer.bg} />} borderColor="rgba(168,85,247,0.15)" />

      {isLive && (
        <div style={{ display: "flex", gap: 1, padding: "8px 12px 0" }}>
          {[{ l: "Active", v: catMatches.filter(m => m.status === "active").length, c: "#22C55E" }, { l: "Done", v: catMatches.filter(m => m.status === "completed" || m.status === "match_end").length, c: "#3B82F6" }, { l: "Players", v: catPlayers.length, c: COLORS.organizer.primary }, { l: "Checked In", v: catPlayers.filter(p => p.checkedIn).length, c: "#F59E0B" }].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: i === 0 ? "10px 0 0 10px" : i === 3 ? "0 10px 10px 0" : 0 }}>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#94A3B8" }}>{s.l}</div>
              <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 23, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", padding: "10px 12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "9px 0", background: "none", border: "none",
            borderBottom: tab === t ? `2px solid ${COLORS.organizer.primary}` : "2px solid transparent",
            color: tab === t ? "#E8ECF4" : "#94A3B8", fontFamily: "DM Sans", fontWeight: 600, fontSize: 15, cursor: "pointer", textTransform: "capitalize"
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: 12 }}>
        {tab === "courts" && isLive && (
          <div className="pp-org-court-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
            {catMatches.map(m => {
              const isA = m.status === "active"; const done = m.status === "completed" || m.status === "match_end";
              return (
                <div key={m.id} style={{ background: done ? "rgba(255,255,255,0.02)" : "rgba(168,85,247,0.04)", border: `1px solid ${done ? "rgba(255,255,255,0.05)" : "rgba(168,85,247,0.15)"}`, borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>{isA && <LiveDot />}<span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 17 }}>Court {m.court}</span></div>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#94A3B8" }}>{done ? "FINAL" : m.scoredBy === "referee" ? "🏁 Ref" : "🏓 Player"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: "#94A3B8" }}><span>{teamDisplay(m.teamA, true)}</span><span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 25, color: "#60A5FA" }}>{m.scoredBy === "referee" && isA ? m.currentGame.a : m.matchScore.a}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: "#94A3B8", marginTop: 2 }}><span>{teamDisplay(m.teamB, true)}</span><span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 25, color: "#F87171" }}>{m.scoredBy === "referee" && isA ? m.currentGame.b : m.matchScore.b}</span></div>
                  <div style={{ marginTop: 6, fontFamily: "JetBrains Mono", fontSize: 12, color: "#94A3B8" }}>{m.round} · Match: {m.matchScore.a}-{m.matchScore.b}</div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "players" && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Chip label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} color={COLORS.organizer.primary} />
              {isLive ? (<>
                <Chip label="Checked In" active={statusFilter === "checked_in"} onClick={() => setStatusFilter("checked_in")} color="#22C55E" />
                <Chip label="Not Yet" active={statusFilter === "not_yet"} onClick={() => setStatusFilter("not_yet")} color="#EF4444" />
              </>) : (<>
                <Chip label="Paid" active={statusFilter === "paid"} onClick={() => setStatusFilter("paid")} color="#22C55E" />
                <Chip label="Registered" active={statusFilter === "registered"} onClick={() => setStatusFilter("registered")} color="#F59E0B" />
              </>)}
              <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.06)", margin: "0 2px" }} />
              <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} style={{
                padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.2)",
                borderRadius: 8, color: "#94A3B8", fontSize: 15, outline: "none", cursor: "pointer"
              }}>
                <option value="all">All Companies</option>
                {companies.map(co => <option key={co} value={co}>{co}</option>)}
              </select>
            </div>

            {/* Action bar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <button style={{ padding: "9px 16px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 8, color: COLORS.organizer.primary, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <span>👤+</span> Assign Referee
              </button>
              <button onClick={() => alert(`Exported ${filteredPlayers.length} players to CSV`)} style={{ padding: "9px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, color: "#22C55E", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <span>📥</span> Export List ({filteredPlayers.length})
              </button>
              <button onClick={() => { setShowBroadcast(!showBroadcast); setBroadcastSent(false); }} style={{ padding: "9px 16px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, color: "#3B82F6", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <span>📢</span> Broadcast ({filteredPlayers.length})
              </button>
            </div>

            {/* Broadcast panel */}
            {showBroadcast && (
              <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: 14, marginBottom: 12, animation: "slideUp 0.2s ease" }}>
                {!broadcastSent ? (<>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#3B82F6", marginBottom: 8 }}>📢 Broadcast to {filteredPlayers.length} {isLive ? (statusFilter === "checked_in" ? "checked-in" : statusFilter === "not_yet" ? "not-checked-in" : "") : (statusFilter === "paid" ? "paid" : statusFilter === "registered" ? "registered" : "")} players{companyFilter !== "all" ? ` at ${companyFilter}` : ""}</div>
                  <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} placeholder="Type your message..." rows={3} style={{
                    width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(59,130,246,0.15)",
                    borderRadius: 8, color: "#E8ECF4", fontSize: 17, outline: "none", resize: "vertical", fontFamily: "DM Sans"
                  }} />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                    <button onClick={() => setShowBroadcast(false)} style={{ padding: "9px 18px", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#94A3B8", fontSize: 15, cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => setBroadcastSent(true)} style={{ padding: "9px 18px", background: "linear-gradient(135deg, #3B82F6, #2563EB)", border: "none", borderRadius: 8, color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Send Message →</button>
                  </div>
                </>) : (
                  <div style={{ textAlign: "center", padding: "8px 0" }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✓</div>
                    <div style={{ fontSize: 17, fontWeight: 600, color: "#22C55E" }}>Broadcast sent to {filteredPlayers.length} players</div>
                    <button onClick={() => setShowBroadcast(false)} style={{ marginTop: 8, padding: "8px 18px", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#94A3B8", fontSize: 15, cursor: "pointer" }}>Dismiss</button>
                  </div>
                )}
              </div>
            )}

            {/* Player count */}
            <div style={{ fontSize: 14, fontFamily: "JetBrains Mono", color: "#94A3B8", letterSpacing: 1, marginBottom: 8 }}>
              Showing {filteredPlayers.length} of {catPlayers.length} players
            </div>

            {/* Player list */}
            {filteredPlayers.map((pl, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 8, marginBottom: 4, animation: `fadeIn 0.2s ease ${i * 0.03}s both`
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{pl.name}</div>
                  <div style={{ fontSize: 14, color: "#94A3B8", display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                    <span>{pl.email}</span>
                    {pl.partner && <span>· Partner: {pl.partner}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <Badge text={pl.company} color="#94A3B8" bg="rgba(255,255,255,0.04)" />
                  {isLive ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: pl.checkedIn ? "#22C55E" : "#94A3B8" }} />
                      <span style={{ fontSize: 14, fontFamily: "JetBrains Mono", color: pl.checkedIn ? "#22C55E" : "#94A3B8", minWidth: 75 }}>{pl.checkedIn ? "Checked In" : "Not Yet"}</span>
                    </div>
                  ) : (
                    <Badge
                      text={pl.paymentStatus === "paid" ? "Paid" : "Registered"}
                      color={pl.paymentStatus === "paid" ? "#22C55E" : "#F59E0B"}
                      bg={pl.paymentStatus === "paid" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)"}
                    />
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "queue" && isLive && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[{ teams: "Garcia/Kim vs. Winner SF-2", round: "Final", eta: "~25 min" }, { teams: "TBD vs. TBD", round: "3rd Place", eta: "~30 min" }].map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit", fontWeight: 700, fontSize: 15, color: "#F59E0B" }}>{i + 1}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 600 }}>{m.teams}</div><div style={{ fontSize: 13, color: "#94A3B8", fontFamily: "JetBrains Mono" }}>{m.round}</div></div>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 14, color: "#F59E0B" }}>{m.eta}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "alerts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {(isLive ? [
              { text: "Court 5 match exceeding 20 min", type: "warning", time: "Just now" },
              { text: "D. Jones has NOT checked in — QF-2 affected", type: "warning", time: "3 min ago" },
              { text: "Court 3: Game 1 complete — Wilson/Brown 11-8", type: "info", time: "5 min ago" },
              { text: "Referee assigned to Court 1 and Court 3", type: "success", time: "12 min ago" },
            ] : [
              { text: "N. Tan registered but payment pending", type: "warning", time: "1 hr ago" },
              { text: "Q. Singh & R. Lee registered for Mixed Doubles", type: "info", time: "3 hr ago" },
              { text: "S. Kumar payment confirmed", type: "success", time: "5 hr ago" },
              { text: "Registration 28% full (18/64)", type: "info", time: "1 day ago" },
            ]).map((a, i) => (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: 8, fontSize: 15,
                background: a.type === "warning" ? "rgba(239,68,68,0.05)" : a.type === "success" ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)",
                borderLeft: `3px solid ${a.type === "warning" ? "#EF4444" : a.type === "success" ? "#22C55E" : "#94A3B8"}`
              }}>
                <div style={{ color: "#E8ECF4" }}>{a.text}</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "#94A3B8", marginTop: 3 }}>{a.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
