"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import {
  Play,
  Sparkles,
  LayoutGrid,
  CheckCircle2,
  ArrowRight,
  Quote,
  Check,
  Brain,
  Zap,
  ListTodo,
  CalendarDays,
  Users,
  MessageSquare,
  Target,
  Lightbulb,
  Rocket,
  Workflow,
  ClipboardCheck,
  Timer,
  TrendingUp,
  FolderKanban,
  Bot,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

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

/* ---------- shared scroll-reveal variants ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/* ---------- floating cta icons ---------- */
interface HeroIconData {
  id: number;
  icon: LucideIcon;
  className: string;
}

const CTA_ICONS: HeroIconData[] = [
  // Left side flank (kept strictly away from center max-w-2xl text)
  { id: 1, icon: Brain,          className: "top-[12%] left-[2%] lg:left-[4%]" },
  { id: 2, icon: ListTodo,       className: "top-[32%] left-[10%] lg:left-[13%]" },
  { id: 3, icon: Lightbulb,      className: "top-[52%] left-[2%] lg:left-[4%]" },
  { id: 4, icon: Target,         className: "top-[72%] left-[9%] lg:left-[12%]" },
  { id: 5, icon: Timer,          className: "top-[88%] left-[2%] lg:left-[4%]" },

  // Right side flank (kept strictly away from center max-w-2xl text)
  { id: 6, icon: Zap,            className: "top-[12%] right-[2%] lg:right-[4%]" },
  { id: 7, icon: Bot,            className: "top-[32%] right-[10%] lg:right-[13%]" },
  { id: 8, icon: ClipboardCheck, className: "top-[52%] right-[2%] lg:right-[4%]" },
  { id: 9, icon: Rocket,         className: "top-[72%] right-[9%] lg:right-[12%]" },
  { id: 10, icon: CalendarDays,  className: "top-[88%] right-[2%] lg:right-[4%]" },
];

const FloatingIcon = ({
  mouseX,
  mouseY,
  iconData,
  index,
}: {
  mouseX: React.RefObject<number>;
  mouseY: React.RefObject<number>;
  iconData: HeroIconData;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  useEffect(() => {
    const onMove = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((mouseX.current - cx) ** 2 + (mouseY.current - cy) ** 2);
      if (dist < 150) {
        const angle = Math.atan2(mouseY.current - cy, mouseX.current - cx);
        const force = (1 - dist / 150) * 50;
        x.set(-Math.cos(angle) * force);
        y.set(-Math.sin(angle) * force);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y, mouseX, mouseY]);

  const IconComp = iconData.icon;

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute ${iconData.className}`}
    >
      <motion.div
        className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 p-2.5 rounded-2xl shadow-lg bg-background/70 backdrop-blur-md border border-border/20"
        animate={{
          y: [0, -6, 0, 6, 0],
          x: [0, 4, 0, -4, 0],
          rotate: [0, 3, 0, -3, 0],
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        <IconComp className="w-6 h-6 md:w-7 md:h-7 text-foreground/60" />
      </motion.div>
    </motion.div>
  );
};

// --- Testimonials Marquee Data & Components ---
interface TestimonialItem {
  text: string;
  image: string;
  name: string;
  role: string;
}

const MARQUEE_TESTIMONIALS: TestimonialItem[] = [
  {
    text: "This platform revolutionized our operations, streamlining workflow and tracking. The cloud-based system keeps us productive, even remotely.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Briana Patton",
    role: "Operations Manager",
  },
  {
    text: "Implementing Kanvexa was smooth and quick. The customizable, user-friendly interface made team training effortless.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Bilal Ahmed",
    role: "IT Manager",
  },
  {
    text: "The support team is exceptional, guiding us through setup and providing ongoing assistance, ensuring our satisfaction.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Saman Malik",
    role: "Customer Support Lead",
  },
  {
    text: "Kanvexa's seamless integration enhanced our business operations and efficiency. Highly recommend for its intuitive interface.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Omar Raza",
    role: "CEO",
  },
  {
    text: "Its robust features and quick support have transformed our workflow, making us significantly more efficient.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Zainab Hussain",
    role: "Project Manager",
  },
  {
    text: "The smooth implementation exceeded expectations. It streamlined processes, improving overall business performance.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Aliza Khan",
    role: "Business Analyst",
  },
  {
    text: "Our business functions improved with a user-friendly design and positive customer feedback.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Farhan Siddiqui",
    role: "Marketing Director",
  },
  {
    text: "They delivered a solution that exceeded expectations, understanding our needs and enhancing our operations.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sana Sheikh",
    role: "Sales Manager",
  },
  {
    text: "Using Kanvexa, our online presence and conversions significantly improved, boosting overall business performance.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Hassan Ali",
    role: "E-commerce Manager",
  },
];

const firstColumn = MARQUEE_TESTIMONIALS.slice(0, 3);
const secondColumn = MARQUEE_TESTIMONIALS.slice(3, 6);
const thirdColumn = MARQUEE_TESTIMONIALS.slice(6, 9);

function MarqueeTestimonialsColumn(props: {
  className?: string;
  testimonials: TestimonialItem[];
  duration?: number;
}) {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <motion.li
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileFocus={{
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  className="p-8 rounded-3xl border border-border/70 shadow-lg shadow-black/5 max-w-xs w-full bg-white/90 dark:bg-card/90 backdrop-blur-md transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <blockquote className="m-0 p-0">
                    <p className="text-muted-foreground leading-relaxed font-normal m-0 text-sm">
                      {text}
                    </p>
                    <footer className="flex items-center gap-3 mt-6">
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={`Avatar of ${name}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-300 ease-in-out"
                      />
                      <div className="flex flex-col text-left">
                        <cite className="font-semibold not-italic tracking-tight leading-5 text-foreground text-sm">
                          {name}
                        </cite>
                        <span className="text-xs leading-5 tracking-tight text-muted-foreground mt-0.5">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
}

export default function LandingPage() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"idle" | "typing" | "generating" | "done">("idle");
  const [visibleCards, setVisible] = useState(0);

  /* floating icons mouse tracking */
  const heroMouseX = useRef(0);
  const heroMouseY = useRef(0);
  const handleHeroMouseMove = (e: React.MouseEvent) => {
    heroMouseX.current = e.clientX;
    heroMouseY.current = e.clientY;
  };
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);

  /* Locomotive Scroll Parallax Effects */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroScrollProgress, [0, 1], [0, -90]);
  const heroOpacity = useTransform(heroScrollProgress, [0, 0.75], [1, 0]);
  const cardRotateX = useTransform(heroScrollProgress, [0, 0.6], [0, 12]);
  const cardScale = useTransform(heroScrollProgress, [0, 0.6], [1, 0.95]);
  const cardY = useTransform(heroScrollProgress, [0, 1], [0, 60]);

  /* CARA KERJA Section Scroll Reveal Parallax */
  const aboutRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: aboutScrollProgress } = useScroll({
    target: aboutRef,
    offset: ["start 0.9", "center 0.55"],
  });

  const aboutY = useTransform(aboutScrollProgress, [0, 1], [90, 0]);
  const aboutScale = useTransform(aboutScrollProgress, [0, 1], [0.92, 1]);
  const aboutRotateX = useTransform(aboutScrollProgress, [0, 1], [14, 0]);
  const aboutOpacity = useTransform(aboutScrollProgress, [0, 0.4, 1], [0.1, 0.8, 1]);

  useEffect(() => {
    const handleScrollEvent = () => {
      // 1. Update scrolled state for navbar background transition
      setIsScrolled(window.scrollY > 20);

      // 2. Scrollspy tracking
      const sections = ["home", "about", "pricing", "contact"];
      const scrollPosition = window.scrollY + 120; // offset of navbar

      // If at the very bottom, force the last section to highlight
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActiveSection("contact");
        return;
      }

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollEvent);
    handleScrollEvent(); // run immediately
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 72;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight + 2;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      setActiveSection(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

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
    <div className="w-full bg-background relative">
      {/* ===================== NAVBAR ===================== */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        animate={{
          paddingTop: isScrolled ? 12 : 0,
          paddingLeft: isScrolled ? 16 : 0,
          paddingRight: isScrolled ? 16 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.nav
          className="flex items-center justify-between font-body w-full"
          animate={{
            maxWidth: isScrolled ? 760 : 9999,
            paddingLeft: isScrolled ? 24 : 80,
            paddingRight: isScrolled ? 24 : 80,
            paddingTop: isScrolled ? 10 : 20,
            paddingBottom: isScrolled ? 10 : 20,
            borderRadius: isScrolled ? 9999 : 0,
          }}
          style={{
            background: isScrolled ? "rgba(var(--background-rgb, 255,255,255), 0.85)" : "transparent",
            backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
            WebkitBackdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
            border: isScrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
            boxShadow: isScrolled ? "0 8px 32px rgba(0,0,0,0.08)" : "0 0px 0px rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            onClick={(e) => handleScroll(e as any, "home")}
            className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            ✦ Kanvexa
          </span>
          <div className="hidden md:flex items-center gap-6">
            {[
              { name: "Home", id: "home" },
              { name: "About", id: "about" },
              { name: "Pricing", id: "pricing" },
              { name: "Contact", id: "contact" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleScroll(e, link.id)}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  activeSection === link.id
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                {activeSection === link.id && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>
          <Link
            href="/signup"
            className="rounded-full px-5 py-2 text-xs md:text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all whitespace-nowrap shadow-sm"
          >
            Get Started
          </Link>
        </motion.nav>
      </motion.div>

      {/* ===================== HERO ===================== */}
      <div ref={heroRef} className="min-h-screen w-full flex flex-col relative overflow-hidden pb-12">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-90"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
            type="video/mp4"
          />
        </video>

        {/* Ambient top overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background z-[1] pointer-events-none" />

        <section id="home" className="relative z-10 flex flex-col items-center w-full px-6 text-center select-none pt-32 md:pt-40">
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="flex flex-col items-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground font-body mb-6 shadow-sm"
            >
              Now with GPT-5 support ✨
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight text-foreground max-w-3xl"
            >
              The Future of <span className="font-display italic text-violet-600 dark:text-violet-400">Smarter</span> Automation
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-center text-base sm:text-lg md:text-xl text-muted-foreground max-w-[650px] leading-relaxed font-body"
            >
              Automate your busywork with intelligent agents that learn, adapt, and execute—so your team can focus on what matters most.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 flex items-center gap-3.5 z-20"
            >
              <Link
                href="/signup"
                className="rounded-full px-7 py-4 text-sm md:text-base font-medium font-body bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center h-12 shadow-lg shadow-primary/10"
              >
                Mulai Gratis Sekarang
              </Link>
              <button className="flex items-center justify-center h-12 w-12 rounded-full border border-border/50 bg-background/90 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:bg-background transition-all cursor-pointer">
                <Play className="h-4 w-4 fill-foreground text-foreground ml-0.5" />
              </button>
            </motion.div>
          </motion.div>

          {/* 3D Locomotive Scroll Parallax Dashboard Card */}
          <motion.div
            style={{
              rotateX: cardRotateX,
              scale: cardScale,
              y: cardY,
              transformPerspective: 1200,
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 w-full max-w-5xl relative z-10"
          >
            <div
              style={{
                borderRadius: "1.25rem",
                overflow: "hidden",
                padding: "0.75rem",
                background: "rgba(255, 255, 255, 0.45)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                boxShadow: "0 30px 90px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
              }}
              className="flex flex-col"
            >
              <div className="rn-demo flex flex-col h-[400px] md:h-[460px] !shadow-none !border-0 !m-0 !max-w-none">
                <div className="rn-demo-bar">
                  <div className="rn-demo-dots">
                    <span style={{ background: "#FF5F57" }} />
                    <span style={{ background: "#FEBC2E" }} />
                    <span style={{ background: "#28C840" }} />
                  </div>
                  <div className="rn-demo-url">kanvexa.app/board/seminar-kampus</div>
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

        {/* curved seam into the next section */}
        <svg className="rn-seam" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,80 C480,0 960,0 1440,80 L1440,80 L0,80 Z" fill="#EFF6FF" />
        </svg>
      </div>

      {/* ===================== HOW IT WORKS ===================== */}
      <section ref={aboutRef} id="about" className="relative z-10 px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-gradient-to-b from-[#EFF6FF] via-[#F4F8FE] to-background overflow-hidden [perspective:1200px]">
        {/* Soft Purple & Blue Ambient Aura Blobs */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[350px] bg-violet-400/25 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[350px] bg-sky-400/25 rounded-full blur-[100px] pointer-events-none z-0" />

        {/* Center-aligned Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center flex flex-col items-center mb-16 relative z-10"
        >
          <motion.span variants={fadeUp} className="rn-eyebrow">CARA KERJA</motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-5xl lg:text-6xl tracking-tight text-foreground mt-4 leading-[1.08] text-center">
            Semua Alur Kerja Proyek Anda, Dalam Satu Workspace Pintar
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-muted-foreground text-base md:text-lg font-body leading-relaxed text-center">
            Kolaborasi real-time, integrasi alat kerja harian, dan AI yang menyusun langkah Anda selanjutnya — Kanvexa bukan sekadar platform manajemen biasa.
          </motion.p>
        </motion.div>

        {/* 3-Column Unified Container with Smooth 3D Perspective Scroll Reveal */}
        <motion.div
          style={{
            y: aboutY,
            scale: aboutScale,
            rotateX: aboutRotateX,
            opacity: aboutOpacity,
            transformStyle: "preserve-3d",
          }}
          className="max-w-6xl mx-auto relative z-10 rounded-3xl border border-white/80 dark:border-white/20 bg-gradient-to-br from-white/60 via-white/25 to-white/35 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl shadow-[0_25px_70px_-15px_rgba(124,58,237,0.18),0_15px_40px_-10px_rgba(59,130,246,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)] overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/60 dark:divide-white/10">
            {/* Step 1 */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div className="bg-gradient-to-b from-white/40 via-white/10 to-white/20 dark:from-white/10 dark:to-white/5 rounded-2xl p-4 h-52 w-full flex items-center justify-center relative overflow-hidden mb-6 border border-white/70 dark:border-white/15 backdrop-blur-xl shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.9),0_8px_20px_rgba(0,0,0,0.03)]">
                <div className="relative w-full max-w-[220px]">
                  <div className="bg-white/75 dark:bg-card/60 p-3 rounded-xl shadow-lg border border-white/90 text-left transform -rotate-3 transition-transform hover:rotate-0 duration-300 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-violet-100/90 dark:bg-violet-950 flex items-center justify-center text-[10px] font-bold text-violet-600">✦</div>
                      <span className="text-xs font-semibold text-foreground">AI Breakdown</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 font-body">"Buat acara seminar kampus..."</p>
                  </div>
                  <div className="bg-white/75 dark:bg-card/60 p-3 rounded-xl shadow-lg border border-white/90 text-left mt-2 translate-x-4 transition-transform hover:translate-x-2 duration-300 backdrop-blur-xl">
                    <div className="flex items-center justify-between text-xs font-medium text-foreground">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> 6 Tugas terurai</span>
                      <span className="text-[10px] bg-emerald-50/90 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-medium">100%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-foreground font-body mb-2">Jelaskan Tujuan Anda</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  Ketik apa yang ingin Anda capai dalam bahasa sehari-hari. Tanpa perlu mengisi templat kosong dari awal.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div className="bg-gradient-to-b from-white/40 via-white/10 to-white/20 dark:from-white/10 dark:to-white/5 rounded-2xl p-4 h-52 w-full flex items-center justify-center relative overflow-hidden mb-6 border border-white/70 dark:border-white/15 backdrop-blur-xl shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.9),0_8px_20px_rgba(0,0,0,0.03)]">
                <div className="flex flex-col items-center gap-3 w-full max-w-[220px]">
                  <div className="flex items-center justify-between w-full bg-white/75 dark:bg-card/60 px-3 py-2 rounded-xl shadow-md border border-white/90 text-xs backdrop-blur-xl">
                    <span className="font-medium text-foreground flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-violet-500" /> Auto Stage</span>
                    <span className="w-7 h-4 bg-violet-600 rounded-full flex items-center justify-end px-0.5"><span className="w-3 h-3 bg-white rounded-full"></span></span>
                  </div>
                  <div className="bg-white/75 dark:bg-card/60 px-4 py-2.5 rounded-xl shadow-lg border border-white/90 flex items-center gap-2 z-10 backdrop-blur-xl">
                    <LayoutGrid className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-semibold text-foreground">4 Kolom Board</span>
                    <span className="text-[10px] bg-violet-100/90 text-violet-700 px-2 py-0.5 rounded-full font-medium">Auto-Sync</span>
                  </div>
                  <div className="flex items-center justify-between w-full bg-white/75 dark:bg-card/60 px-3 py-2 rounded-xl shadow-md border border-white/90 text-xs opacity-90 backdrop-blur-xl">
                    <span className="font-medium text-foreground">Integrasi Tim</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Aktif</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-foreground font-body mb-2">Kanvexa Menyusun Alur Kerja</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  Tugas dikelompokkan ke dalam tahap-tahap otomatis, diberi label, dan siap dibagikan ke tim Anda.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div className="bg-gradient-to-b from-white/40 via-white/10 to-white/20 dark:from-white/10 dark:to-white/5 rounded-2xl p-4 h-52 w-full flex flex-col justify-center gap-2 relative overflow-hidden mb-6 border border-white/70 dark:border-white/15 backdrop-blur-xl shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.9),0_8px_20px_rgba(0,0,0,0.03)]">
                <div className="self-end bg-violet-600/90 text-white px-3 py-1.5 rounded-xl rounded-br-xs text-[11px] font-medium shadow-md max-w-[180px] text-right backdrop-blur-sm">
                  Tentukan venue & pembicara
                </div>
                <div className="self-start bg-white/75 dark:bg-card/60 p-3 rounded-xl shadow-lg border border-white/90 max-w-[210px] text-left backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">Status: In Progress</span>
                    <span className="text-[10px] bg-amber-100/90 text-amber-800 px-1.5 py-0.5 rounded font-medium">Hari-H</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Briefing panitia & rundown siap</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-foreground font-body mb-2">Tim Anda Tinggal Eksekusi</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  Edit, atur ulang penanggung jawab, atau tambahkan kartu secara bebas — alur kerja beradaptasi seiring perubahan rencana.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-gradient-to-b from-[#EBF3FF] via-[#EEF2FF] to-[#F5F3FF] dark:from-background dark:via-background/70 dark:to-background overflow-hidden">
        {/* Soft Ambient Glow Orbs */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[400px] bg-blue-400/25 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[600px] h-[400px] bg-violet-400/25 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center flex flex-col items-center mb-16 relative z-10"
        >
          <motion.span variants={fadeUp} className="rn-eyebrow">FITUR UTAMA</motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground leading-[1.08] mt-3">
            Manajemen Fitur yang Menyesuaikan Alur Kerja Anda
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground font-body leading-relaxed">
            Atur, tentukan prioritas, dan pantau setiap fitur dengan presisi. Kanvexa membantu tim menyelesaikan proyek lebih cepat dengan memberikan struktur pada alur kerja Anda.
          </motion.p>
        </motion.div>

        {/* Bento Grid Layout with Smooth Staggered Scroll Reveal & Liquid Glass Styling */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
          {/* Card 1: Smart Task Management (Col span 6) */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.93 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
            className="md:col-span-6 bg-gradient-to-br from-white/70 via-white/35 to-white/45 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-white/20 p-6 md:p-8 flex flex-col justify-between shadow-[0_15px_35px_rgba(79,70,229,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_25px_50px_rgba(124,58,237,0.15)] transition-all duration-300"
          >
            <div className="bg-gradient-to-b from-blue-100/40 via-violet-100/20 to-white/40 dark:from-white/10 dark:to-white/5 rounded-2xl h-56 p-4 flex items-center justify-center relative overflow-hidden mb-6 border border-white/70 dark:border-white/15 backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.03)]">
              <div className="bg-white/85 dark:bg-card/80 rounded-xl p-3 shadow-md border border-white/90 dark:border-white/10 w-full max-w-[280px] backdrop-blur-md">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-foreground mb-2">
                  <span>Last Projects</span>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded-full text-[10px]">3</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="bg-muted/50 p-2 rounded-lg border border-border/40">
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded bg-violet-500" /> 1 hour ago</div>
                    <p className="text-[10px] font-semibold text-foreground mt-1 truncate">Project Migration</p>
                    <span className="inline-block mt-1 text-[8px] bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 px-1 rounded">Development</span>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-lg border border-border/40">
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded bg-emerald-500" /> Now</div>
                    <p className="text-[10px] font-semibold text-foreground mt-1 truncate">VR Automation</p>
                    <span className="inline-block mt-1 text-[8px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1 rounded">UI/UX</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-xl text-foreground font-body">Smart Task Management</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mt-2">
                Organize and prioritize tasks with intelligent automation that adapts to your workflow patterns.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Team Collaboration (Col span 6) */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.93 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
            className="md:col-span-6 bg-gradient-to-br from-white/70 via-white/35 to-white/45 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-white/20 p-6 md:p-8 flex flex-col justify-between shadow-[0_15px_35px_rgba(79,70,229,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_25px_50px_rgba(124,58,237,0.15)] transition-all duration-300"
          >
            <div className="bg-gradient-to-b from-blue-100/40 via-violet-100/20 to-white/40 dark:from-white/10 dark:to-white/5 rounded-2xl h-56 p-4 flex items-center justify-center relative overflow-hidden mb-6 border border-white/70 dark:border-white/15 backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.03)]">
              <div className="bg-white/85 dark:bg-card/80 rounded-xl p-3.5 shadow-md border border-white/90 dark:border-white/10 w-full max-w-[260px] text-left backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-full">High Priority</span>
                  <span className="text-muted-foreground text-xs">•••</span>
                </div>
                <p className="text-xs font-semibold text-foreground mt-2">Feature Section - Web Design</p>
                <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                  <span>6+ Members</span>
                  <div className="flex -space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[8px] flex items-center justify-center font-bold border border-white">A</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] flex items-center justify-center font-bold border border-white">N</span>
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[8px] flex items-center justify-center font-bold border border-white">F</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-500 to-sky-400 h-full w-[89%]" />
                </div>
                <div className="text-right text-[9px] text-muted-foreground mt-1 font-mono">89%</div>
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-xl text-foreground font-body">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mt-2">
                Connect with your team seamlessly through integrated communication and shared workspaces.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Advanced Analytics (Col span 7 - Wider) */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.93 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
            className="md:col-span-7 bg-gradient-to-br from-white/70 via-white/35 to-white/45 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-white/20 p-6 md:p-8 flex flex-col justify-between shadow-[0_15px_35px_rgba(79,70,229,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_25px_50px_rgba(124,58,237,0.15)] transition-all duration-300"
          >
            <div className="bg-gradient-to-b from-blue-100/40 via-violet-100/20 to-white/40 dark:from-white/10 dark:to-white/5 rounded-2xl h-56 p-4 flex items-center justify-center relative overflow-hidden mb-6 border border-white/70 dark:border-white/15 backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.03)]">
              <div className="bg-white/85 dark:bg-card/80 rounded-xl p-3 shadow-md border border-white/90 dark:border-white/10 w-full max-w-[340px] backdrop-blur-md">
                <div className="text-left text-[11px] font-semibold text-foreground mb-2 flex items-center justify-between">
                  <span>Schedule Meeting</span>
                  <span className="text-[9px] text-muted-foreground font-normal">Jan 2026</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[9px]">
                  <div className="bg-muted/40 p-1.5 rounded-lg border border-border/30">
                    <div className="text-muted-foreground">Mon 15</div>
                    <div className="mt-1 bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 p-1 rounded text-[8px] font-medium text-left">Review Sync</div>
                  </div>
                  <div className="bg-muted/40 p-1.5 rounded-lg border border-border/30">
                    <div className="text-muted-foreground">Tue 16</div>
                    <div className="mt-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 p-1 rounded text-[8px] font-medium text-left">Sprint Sync</div>
                  </div>
                  <div className="bg-muted/40 p-1.5 rounded-lg border border-border/30">
                    <div className="text-muted-foreground">Wed 17</div>
                    <div className="mt-1 bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 p-1 rounded text-[8px] font-medium text-left">Kick Off</div>
                  </div>
                  <div className="bg-muted/40 p-1.5 rounded-lg border border-border/30">
                    <div className="text-muted-foreground">Thu 18</div>
                    <div className="mt-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 p-1 rounded text-[8px] font-medium text-left font-mono">Feedback</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-xl text-foreground font-body">Advanced Analytics</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mt-2">
                Get comprehensive insights into your project performance with detailed analytics and customizable reports.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Project Timeline (Col span 5 - Narrower) */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.93 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.3, ease: "easeOut" } }}
            className="md:col-span-5 bg-gradient-to-br from-white/70 via-white/35 to-white/45 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-white/20 p-6 md:p-8 flex flex-col justify-between shadow-[0_15px_35px_rgba(79,70,229,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_25px_50px_rgba(124,58,237,0.15)] transition-all duration-300"
          >
            <div className="bg-gradient-to-b from-blue-100/40 via-violet-100/20 to-white/40 dark:from-white/10 dark:to-white/5 rounded-2xl h-56 p-4 flex items-center justify-center relative overflow-hidden mb-6 border border-white/70 dark:border-white/15 backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_8px_20px_rgba(0,0,0,0.03)]">
              <div className="bg-white/85 dark:bg-card/80 rounded-xl p-3 shadow-md border border-white/90 dark:border-white/10 w-full max-w-[240px] backdrop-blur-md">
                <div className="flex items-center justify-between text-[11px] font-semibold text-foreground mb-2">
                  <span className="flex items-center gap-1 text-violet-600"><Sparkles className="w-3 h-3" /> Category AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between bg-muted/40 px-2 py-1 rounded border border-border/30">
                    <span className="text-foreground">Testing</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div className="flex items-center justify-between bg-muted/40 px-2 py-1 rounded border border-border/30">
                    <span className="text-foreground">Voice Intent Design</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div className="flex items-center justify-between bg-muted/40 px-2 py-1 rounded border border-border/30">
                    <span className="text-foreground">Visual Output</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-xl text-foreground font-body">Project Timeline</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mt-2">
                Visualize project progress and milestones with interactive timeline views and dependency tracking.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-24 md:py-32 overflow-hidden">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center flex flex-col items-center mb-16"
        >
          <motion.span variants={fadeUp} className="rn-eyebrow">Diandalkan Tim yang Bergerak Cepat</motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground leading-[1.08] mt-3">
            Kurangi Koordinasi, Perbanyak Eksekusi
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-base md:text-lg text-muted-foreground font-body leading-relaxed max-w-2xl mx-auto">
            Pelajari bagaimana ribuan tim mengefisiensikan operasional mereka dan menyelesaikan proyek lebih cepat bersama Kanvexa.
          </motion.p>
        </motion.div>

        <div
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <MarqueeTestimonialsColumn testimonials={firstColumn} duration={15} />
          <MarqueeTestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <MarqueeTestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </section>

      {/* ===================== PRICING ===================== */}
      <section id="pricing" className="relative z-10 px-6 md:px-12 lg:px-20 py-20 bg-[var(--bg-soft)]">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.span variants={fadeUp} className="rn-eyebrow">Pricing</motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl tracking-tight text-foreground mt-3">
            Start free, scale when you need to
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
        >
          {[
            { name: "Starter", price: "Free", note: "for individuals", features: ["1 active board", "Up to 20 tasks", "Basic AI parsing"], highlighted: false },
            { name: "Team", price: "$12", note: "/ seat / month", features: ["Unlimited boards", "Unlimited tasks", "Full AI automation", "Shared workspaces"], highlighted: true },
            { name: "Enterprise", price: "Custom", note: "for organizations", features: ["SSO & permissions", "Dedicated support", "Custom integrations"], highlighted: false },
          ].map((p) => (
            <motion.div key={p.name} variants={fadeUp} className={`rn-price-card ${p.highlighted ? "is-highlighted" : ""}`}>
              {p.highlighted && <span className="rn-price-badge">Most popular</span>}
              <h3 className="font-display text-2xl text-foreground">{p.name}</h3>
              <p className="mt-4 mb-1">
                <span className="text-3xl font-semibold text-foreground font-display">{p.price}</span>
                <span className="text-sm text-muted-foreground ml-1">{p.note}</span>
              </p>
              <ul className="mt-6 mb-8 space-y-3 text-left">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground font-body">
                    <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--violet)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`rn-price-btn ${p.highlighted ? "is-active" : ""}`}>
                {p.name === "Enterprise" ? "Talk to sales" : "Get started"}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===================== FINAL CTA ===================== */}
      <section id="contact" className="relative z-10 px-6 md:px-12 lg:px-20 py-24 md:py-32 text-center overflow-hidden min-h-[520px] flex flex-col justify-center" onMouseMove={handleHeroMouseMove}>
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-70"
        >
          <source
            src="https://vjs.zencdn.net/v/oceans.mp4"
            type="video/mp4"
          />
        </video>

        {/* Ambient Gradient Overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background z-0 pointer-events-none" />

        {/* Floating interactive icons - strictly positioned on left & right flanks */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden md:block">
          {CTA_ICONS.map((iconData, index) => (
            <FloatingIcon
              key={iconData.id}
              mouseX={heroMouseX}
              mouseY={heroMouseY}
              iconData={iconData}
              index={index}
            />
          ))}
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground leading-[1.05]">
            Satu Papan untuk Semua Alat Kerja
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 max-w-xl mx-auto text-base md:text-lg text-muted-foreground font-body leading-relaxed">
            Kelola semua tugas, proyek, dan integrasi aplikasi Anda dalam satu alur kerja cerdas berbasis AI.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-full px-7 py-4 text-sm md:text-base font-medium font-body bg-primary text-primary-foreground hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-xl shadow-primary/10"
            >
              Mulai Gratis Sekarang <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="mailto:hello@nexora.app"
              className="rounded-full px-7 py-4 text-sm md:text-base font-medium font-body border border-border/80 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors shadow-sm"
            >
              Hubungi Kami
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="relative z-10 px-6 md:px-12 lg:px-20 py-12 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              ✦ Kanvexa
            </span>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs font-body">
              Automate your busywork with intelligent agents that plan, adapt, and execute.
            </p>
          </div>
          <div className="flex items-center gap-6">
            {[
              { name: "Home", id: "home" },
              { name: "About", id: "about" },
              { name: "Pricing", id: "pricing" },
              { name: "Contact", id: "contact" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleScroll(e, link.id)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Twitter className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
            <Instagram className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
            <Linkedin className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
          </div>
        </div>
        <p className="max-w-6xl mx-auto mt-8 pt-6 border-t border-border text-xs text-muted-foreground font-mono">
          © {new Date().getFullYear()} Kanvexa. All rights reserved.
        </p>
      </footer>

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
.rn-demo-dots { display: flex; gap: 5px; }
.rn-demo-dots span { width: 10px; height: 10px; border-radius: 50%; display: block; }
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
.rn-demo-typed { font-size: 14px; color: var(--text-1); min-height: 20px; }
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
.rn-demo-btn.is-active { background: var(--ink); color: #fff; }
.rn-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  padding: 16px;
  background: var(--bg-soft);
  min-height: 280px;
}
.rn-board-col { padding: 0 6px; }
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
.rn-board-col-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.rn-board-col-count {
  margin-left: auto;
  background: var(--line);
  border-radius: 100px;
  font-size: 11px;
  padding: 1px 6px;
  color: var(--text-3);
}
.rn-board-col-body { display: flex; flex-direction: column; gap: 6px; }
.rn-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 12px;
  border-left-width: 3px;
  border-left-style: solid;
}
.rn-card p { margin: 0 0 6px; font-size: 12px; font-weight: 500; color: var(--text-1); line-height: 1.4; }
.rn-tag { font-size: 10px; font-weight: 600; border-radius: 4px; padding: 2px 6px; color: var(--text-2); }
.rn-card-empty {
  border: 1px dashed #D6D0C4;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  font-size: 11px;
  color: var(--text-3);
}

/* seam between hero and the rest of the page */
.rn-seam { position: absolute; left: 0; right: 0; bottom: -1px; width: 100%; height: 60px; z-index: 5; }

/* eyebrow label used across sections */
.rn-eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
  border: 1px solid var(--line);
  border-radius: 100px;
  padding: 4px 12px;
  background: var(--white);
}

/* how it works */
.rn-step { position: relative; text-align: center; display: flex; flex-direction: column; align-items: center; }
.rn-step-line { position: absolute; top: 26px; left: 0; width: 100%; height: 2px; }
.rn-step-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  background: var(--background);
}
.rn-step-n {
  position: absolute;
  top: -6px;
  right: calc(50% - 46px);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
  z-index: 2;
}

/* feature cards */
.rn-feature-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-top-width: 3px;
  border-top-style: solid;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.rn-feature-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.06); }

/* testimonials */
.rn-testimonial {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 24px;
  text-align: left;
}
.rn-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

/* pricing */
.rn-price-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 28px 24px;
  text-align: left;
  position: relative;
  display: flex;
  flex-direction: column;
}
.rn-price-card.is-highlighted { border-color: var(--ink); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
.rn-price-badge {
  position: absolute;
  top: -12px;
  left: 24px;
  background: var(--ink);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 100px;
  font-family: var(--font-mono);
}
.rn-price-btn {
  margin-top: auto;
  padding: 12px 16px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  background: var(--bg-soft);
  color: var(--text-1);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: background 0.25s, color 0.25s;
}
.rn-price-btn.is-active { background: var(--ink); color: #fff; border-color: var(--ink); }
.rn-price-btn:hover { opacity: 0.85; }

@media (max-width: 860px) {
  .rn-board { grid-template-columns: repeat(2, 1fr); row-gap: 18px; }
}
@media (max-width: 560px) {
  .rn-board { grid-template-columns: 1fr; }
  .rn-demo-input-row { flex-direction: column; align-items: stretch; }
}
`;
