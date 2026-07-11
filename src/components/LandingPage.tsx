"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const DEMO_TEXT = "Buat acara seminar kampus bulan depan";

const DEMO_CARDS: { col: string; color: string; title: string; tag: string }[] = [
  { col: "Persiapan", color: "violet", title: "Tentukan tema & pembicara", tag: "Penting" },
  { col: "Persiapan", color: "violet", title: "Booking venue & catering", tag: "Koordinasi" },
  { col: "Promosi", color: "mint", title: "Buat poster & konten sosmed", tag: "Desain" },
  { col: "Promosi", color: "mint", title: "Buka pendaftaran peserta", tag: "Form" },
  { col: "Hari-H", color: "amber", title: "Briefing panitia pagi hari", tag: "Rundown" },
  { col: "Evaluasi", color: "rose", title: "Kumpulkan feedback peserta", tag: "Laporan" },
];

const COLS = ["Persiapan", "Promosi", "Hari-H", "Evaluasi"];
const COL_DOT: Record<string, string> = {
  Persiapan: "var(--violet)",
  Promosi: "var(--mint)",
  "Hari-H": "var(--amber)",
  Evaluasi: "var(--rose)",
};
const TAG_BG: Record<string, string> = {
  violet: "var(--violet-soft)",
  mint: "#DCF6EF",
  amber: "#FCEACB",
  rose: "#FBE2E9",
};

export default function LandingPage() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"idle" | "typing" | "generating" | "done">("idle");
  const [visibleCards, setVisible] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("typing"), 700);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase !== "typing") return;
    if (typed.length < DEMO_TEXT.length) {
      const t = setTimeout(() => setTyped(DEMO_TEXT.slice(0, typed.length + 1)), 38);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("generating"), 450);
    return () => clearTimeout(t);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "generating") return;
    if (visibleCards < DEMO_CARDS.length) {
      const t = setTimeout(() => setVisible((n) => n + 1), 260);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("done"), 400);
    return () => clearTimeout(t);
  }, [phase, visibleCards]);

  const cardsByCol = COLS.reduce<Record<string, typeof DEMO_CARDS>>((acc, col) => {
    acc[col] = DEMO_CARDS.filter((c) => c.col === col && DEMO_CARDS.indexOf(c) < visibleCards);
    return acc;
  }, {});

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden relative">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4" type="video/mp4" />
      </video>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 font-body">
        <span className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-1.5">
          ✦ Nexora
        </span>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#home" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
        </div>
        <Link href="/signup" className="rounded-full px-5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          Get Started
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center w-full flex-1 px-6 text-center select-none overflow-hidden pt-6">
        {/* 1. Badge (top) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground font-body mb-6"
        >
          Now with GPT-5 support ✨
        </motion.div>

        {/* 2. Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center font-display text-5xl md:text-6xl lg:text-[5rem] leading-[0.95] tracking-tight text-foreground max-w-xl"
        >
          The Future of <span className="font-display italic">Smarter</span> Automation
        </motion.h1>

        {/* 3. Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-[650px] leading-relaxed font-body"
        >
          Automate your busywork with intelligent agents that learn, adapt, and execute—so your team can focus on what matters most.
        </motion.p>

        {/* 4. CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-5 flex items-center gap-3 z-20"
        >
          <Link
            href="/signup"
            className="rounded-full px-6 py-5 text-sm font-medium font-body bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center h-12"
          >
            Book a demo
          </Link>
          <button className="flex items-center justify-center h-11 w-11 rounded-full border-0 bg-background shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:bg-background/80 transition-colors cursor-pointer">
            <Play className="h-4 w-4 fill-foreground text-foreground" />
          </button>
        </motion.div>

        {/* 5. Dashboard Preview (Kanban board demo from the previous design wrapped in a frosted glass wrapper) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 w-full max-w-5xl flex-1 flex flex-col justify-start overflow-hidden relative"
        >
          <div
            style={{
              borderRadius: "1rem",
              overflow: "hidden",
              padding: "1rem",
              background: "rgba(255, 255, 255, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "var(--shadow-dashboard)",
              height: "100%",
            }}
            className="flex flex-col"
          >
            {/* Kanban Board Demo internals */}
            <div className="rn-demo flex flex-col h-full !shadow-none !border-0 !m-0 !max-w-none">
              <div className="rn-demo-bar">
                <div className="rn-demo-dots">
                  <span style={{ background: "#FF5F57" }} />
                  <span style={{ background: "#FEBC2E" }} />
                  <span style={{ background: "#28C840" }} />
                </div>
                <div className="rn-demo-url">rencanai.app/board/seminar-kampus</div>
              </div>

              <div className="rn-demo-input-row">
                <div className="rn-demo-input">
                  <svg width="16" height="16" fill="none" stroke="var(--violet)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4l3 3" />
                  </svg>
                  <span className="rn-demo-typed">
                    {typed}
                    {(phase === "typing" || phase === "idle") && <span className="rn-cursor" />}
                  </span>
                </div>
                <button className={`rn-demo-btn ${phase === "generating" || phase === "done" ? "is-active" : ""}`}>
                  {phase === "generating" ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rn-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                      Mengurai...
                    </>
                  ) : "✦ Urai jadi tugas"}
                </button>
              </div>

              <div className="rn-board flex-1 overflow-y-auto">
                {COLS.map((col) => (
                  <div key={col} className="rn-board-col">
                    <div className="rn-board-col-head">
                      <span className="rn-board-col-dot" style={{ background: COL_DOT[col] }} />
                      <span>{col}</span>
                      <span className="rn-board-col-count">{cardsByCol[col].length}</span>
                    </div>
                    <div className="rn-board-col-body">
                      {cardsByCol[col].map((card) => (
                        <div key={card.title} className="rn-card rn-card-pop" style={{ borderLeftColor: COL_DOT[col] }}>
                          <p>{card.title}</p>
                          <span className="rn-tag" style={{ background: TAG_BG[card.color] }}>{card.tag}</span>
                        </div>
                      ))}
                      {phase === "done" && cardsByCol[col].length === 0 && (
                        <div className="rn-card-empty">Tambah kartu</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <style>{STYLES}</style>
    </div>
  );
}

const STYLES = `
.rn-demo {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
  text-align: left;
}
.rn-demo-bar {
  background: var(--bg-soft);
  border-bottom: 1px solid var(--line);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.rn-demo-dots {
  display: flex;
  gap: 5px;
}
.rn-demo-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: block;
}
.rn-demo-url {
  flex: 1;
  max-width: 320px;
  margin: 0 auto;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 3px 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
  text-align: center;
}
.rn-demo-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}
.rn-demo-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--bg-soft);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 14px;
}
.rn-demo-typed {
  font-size: 14px;
  color: var(--text-1);
  min-height: 20px;
}
.rn-demo-btn {
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  background: #E7E2D9;
  color: var(--text-3);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: background 0.3s, color 0.3s;
}
.rn-demo-btn.is-active {
  background: var(--ink);
  color: #fff;
}
.rn-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  padding: 16px;
  background: var(--bg-soft);
  min-height: 280px;
}
.rn-board-col {
  padding: 0 6px;
}
.rn-board-col-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  letter-spacing: 0.02em;
}
.rn-board-col-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.rn-board-col-count {
  margin-left: auto;
  background: var(--line);
  border-radius: 100px;
  font-size: 11px;
  padding: 1px 6px;
  color: var(--text-3);
}
.rn-board-col-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rn-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 12px;
  border-left-width: 3px;
  border-left-style: solid;
}
.rn-card p {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-1);
  line-height: 1.4;
}
.rn-tag {
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  padding: 2px 6px;
  color: var(--text-2);
}
.rn-card-empty {
  border: 1px dashed #D6D0C4;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  font-size: 11px;
  color: var(--text-3);
}

@media (max-width: 860px) {
  .rn-board { grid-template-columns: repeat(2, 1fr); row-gap: 18px; }
}
@media (max-width: 560px) {
  .rn-board { grid-template-columns: 1fr; }
  .rn-demo-input-row { flex-direction: column; align-items: stretch; }
}
`;
