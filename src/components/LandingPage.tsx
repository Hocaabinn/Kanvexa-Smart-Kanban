"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { KanvexaLogo } from "@/components/ui/KanvexaLogo";
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
  HelpCircle,
  MessageCircle,
  ChevronDown,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
  { id: 1, icon: Brain, className: "top-[12%] left-[2%] lg:left-[4%]" },
  { id: 2, icon: ListTodo, className: "top-[32%] left-[10%] lg:left-[13%]" },
  { id: 3, icon: Lightbulb, className: "top-[52%] left-[2%] lg:left-[4%]" },
  { id: 4, icon: Target, className: "top-[72%] left-[9%] lg:left-[12%]" },
  { id: 5, icon: Timer, className: "top-[88%] left-[2%] lg:left-[4%]" },

  // Right side flank (kept strictly away from center max-w-2xl text)
  { id: 6, icon: Zap, className: "top-[12%] right-[2%] lg:right-[4%]" },
  { id: 7, icon: Bot, className: "top-[32%] right-[10%] lg:right-[13%]" },
  { id: 8, icon: ClipboardCheck, className: "top-[52%] right-[2%] lg:right-[4%]" },
  { id: 9, icon: Rocket, className: "top-[72%] right-[9%] lg:right-[12%]" },
  { id: 10, icon: CalendarDays, className: "top-[88%] right-[2%] lg:right-[4%]" },
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
          duration: 5 + ((index * 3) % 5),
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

const CustomAccordion = AccordionPrimitive.Root;

const CustomAccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('', className)}
    {...props}
  />
));
CustomAccordionItem.displayName = 'CustomAccordionItem';

const CustomAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center justify-between gap-4 rounded-2xl p-4 sm:p-5 text-left',
        'bg-white/75 backdrop-blur-xl text-slate-900 border border-white/90 shadow-md shadow-indigo-950/5',
        'hover:bg-white/90 hover:border-white hover:shadow-lg transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40',
        'data-[state=open]:bg-white/95 data-[state=open]:border-white data-[state=open]:shadow-lg',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25">
          <HelpCircle className="h-5 w-5 text-white" />
        </div>
        <span className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          {children}
        </span>
      </div>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/90 border border-indigo-100 text-indigo-700 shadow-xs transition-transform duration-300 group-hover:scale-105 group-data-[state=open]:rotate-180">
        <ChevronDown className="h-4 w-4 text-indigo-700" />
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
CustomAccordionTrigger.displayName = 'CustomAccordionTrigger';

const CustomAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-slate-800',
      'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down pb-2',
      className
    )}
    {...props}
  >
    <div className="mt-3 sm:mt-4 ml-0 sm:ml-14">
      <div className="flex items-start gap-4 rounded-2xl bg-white/85 backdrop-blur-xl p-4 sm:p-5 shadow-sm border border-white/90 transition-all">
        <span className="flex-1 text-sm sm:text-base leading-relaxed text-slate-700 font-medium">{children}</span>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm transition-transform hover:scale-105">
          <MessageCircle className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  </AccordionPrimitive.Content>
));
CustomAccordionContent.displayName = 'CustomAccordionContent';

export {
  CustomAccordion,
  CustomAccordionItem,
  CustomAccordionTrigger,
  CustomAccordionContent,
};

const faqs = [
  {
    question: 'Apa itu Kanvexa dan bagaimana cara kerjanya?',
    answer:
      'Kanvexa adalah platform Kanban board cerdas berbasis AI yang mengubah perintah satu kalimat menjadi rencana kerja, alur tugas, dan daftar Kanban otomatis.',
  },
  {
    question: 'Apakah Kanvexa mendukung kolaborasi tim?',
    answer:
      'Ya! Kanvexa dirancang untuk tim modern dengan dukungan pembaruan real-time, pembagian tugas anggota, serta tracking status papan bersama.',
  },
  {
    question: 'Apakah ada paket uji coba gratis?',
    answer:
      'Tentu saja. Anda dapat mendaftar dan mencoba fitur utama Kanvexa secara gratis tanpa memerlukan kartu kredit.',
  },
  {
    question: 'Bagaimana AI Kanvexa memecah proyek saya?',
    answer:
      'Cukup ketik ide atau instruksi proyek Anda, AI Kanvexa akan otomatis menganalisis dan membaginya menjadi beberapa sub-tugas yang terstruktur.',
  },
  {
    question: 'Apakah data proyek saya aman di Kanvexa?',
    answer:
      'Keamanan data adalah prioritas utama kami. Semua data disimpan dan dilindungi menggunakan enkripsi standar industri serta infrastruktur cloud Supabase.',
  },
];

export function AccordionComponent() {
  return (
    <section id="faq" className="relative z-10 px-6 md:px-12 lg:px-20 py-24 md:py-28 overflow-hidden bg-gradient-to-br from-indigo-100/90 via-purple-100/80 to-pink-100/90">
      {/* Bright Vibrant Glowing Aura Blobs */}
      <div className="absolute top-12 left-1/4 w-[450px] h-[350px] bg-indigo-400/30 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-12 right-1/4 w-[450px] h-[350px] bg-pink-400/30 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-purple-400/25 rounded-full blur-[110px] pointer-events-none z-0" />

      <div className="max-w-3xl w-full mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-700 bg-white/80 border border-white/90 rounded-full shadow-sm backdrop-blur-md mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3.5 text-slate-700 text-sm sm:text-base max-w-lg mx-auto font-medium">
            Pertanyaan umum seputar penggunaan Kanvexa, AI task breakdown, dan fitur alur kerja.
          </p>
        </div>
        <CustomAccordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="space-y-4 sm:space-y-5"
        >
          {faqs.map((faq, index) => (
            <CustomAccordionItem
              key={index}
              value={`item-${index}`}
            >
              <CustomAccordionTrigger>{faq.question}</CustomAccordionTrigger>
              <CustomAccordionContent>{faq.answer}</CustomAccordionContent>
            </CustomAccordionItem>
          ))}
        </CustomAccordion>
      </div>
    </section>
  );
}

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans?: PricingPlan[];
  title?: string;
  description?: string;
}

const defaultPlans: PricingPlan[] = [
  {
    name: "STARTER",
    price: "19",
    yearlyPrice: "15",
    period: "per bulan",
    features: [
      "Hingga 5 papan Kanban",
      "AI Task Breakdown dasar",
      "Kolaborasi 3 anggota tim",
      "Dukungan komunitas",
    ],
    description: "Cocok untuk individu dan tim kecil yang baru mulai.",
    buttonText: "Mulai Gratis",
    href: "/signup",
    isPopular: false,
  },
  {
    name: "PROFESSIONAL",
    price: "49",
    yearlyPrice: "39",
    period: "per bulan",
    features: [
      "Papan Kanban tak terbatas",
      "AI Task Breakdown tanpa batas",
      "Hingga 15 anggota tim",
      "Analitik alur kerja tingkat lanjut",
      "Prioritas dukungan 24/7",
      "Integrasi kustom",
    ],
    description: "Ideal untuk tim dan bisnis yang terus berkembang.",
    buttonText: "Coba Pro Gratis",
    href: "/signup",
    isPopular: true,
  },
  {
    name: "ENTERPRISE",
    price: "149",
    yearlyPrice: "119",
    period: "per bulan",
    features: [
      "Semua fitur Paket Professional",
      "Anggota tim tanpa batas",
      "Dedicated Account Manager",
      "SSO & Keamanan tingkat tinggi",
      "SLA Garansi Uptime 99.9%",
      "Kontrak & tagihan kustom",
    ],
    description: "Untuk organisasi besar yang membutuhkan skala & kontrol ekstra.",
    buttonText: "Hubungi Tim Sales",
    href: "mailto:hello@nexora.app",
    isPopular: false,
  },
];

export function PricingSection({
  plans = defaultPlans,
  title = "Pilihan Paket Harga Simpel & Transparan",
  description = "Pilih paket yang sesuai dengan kebutuhan tim Anda.\nSemua paket mencakup akses penuh ke AI breakdown & kolaborasi papan Kanban.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 60,
        spread: 70,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["#6366f1", "#8b5cf6", "#ec4899", "#3b82f6"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <section id="pricing" className="relative z-10 px-6 md:px-12 lg:px-20 py-24 md:py-32 overflow-hidden bg-gradient-to-br from-indigo-100/90 via-purple-100/80 to-pink-100/90">
      {/* Bright Glowing Aura Blobs */}
      <div className="absolute top-10 left-10 w-[500px] h-[350px] bg-indigo-400/25 rounded-full blur-[110px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[350px] bg-pink-400/25 rounded-full blur-[110px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-400/20 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-3 mb-12">
          <span className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-700 bg-white/80 border border-white/90 rounded-full shadow-sm backdrop-blur-md mb-2">
            PRICING
          </span>
          <h2 className="text-4xl font-bold font-display tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            {title}
          </h2>
          <p className="text-slate-700 font-medium text-base sm:text-lg max-w-2xl mx-auto whitespace-pre-line leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex justify-center items-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/80 border border-white/90 shadow-md backdrop-blur-md px-6 py-3 rounded-full">
            <span className={cn("text-sm font-semibold transition-colors cursor-pointer", isMonthly ? "text-slate-900 font-bold" : "text-slate-500")} onClick={() => handleToggle(false)}>
              Bulanan
            </span>
            <Label className="flex items-center">
              <Switch
                ref={switchRef as any}
                checked={!isMonthly}
                onCheckedChange={handleToggle}
                className="relative"
              />
            </Label>
            <span className={cn("text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer", !isMonthly ? "text-indigo-700 font-bold" : "text-slate-500")} onClick={() => handleToggle(true)}>
              Tahunan <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-xs">Hemat 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 1 }}
              whileInView={
                isDesktop
                  ? {
                      y: plan.isPopular ? -12 : 0,
                      opacity: 1,
                      scale: plan.isPopular ? 1.04 : 0.98,
                    }
                  : {}
              }
              viewport={{ once: true }}
              transition={{
                duration: 1.2,
                type: "spring",
                stiffness: 100,
                damping: 25,
                delay: index * 0.15,
              }}
              className={cn(
                `rounded-3xl p-7 sm:p-8 backdrop-blur-xl relative flex flex-col justify-between transition-all duration-300 min-h-[520px]`,
                plan.isPopular
                  ? "bg-white/95 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20 z-10"
                  : "bg-white/75 border border-white/90 shadow-lg shadow-indigo-950/5 z-0"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>Popular Choice</span>
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold tracking-wider uppercase text-indigo-700">
                    {plan.name}
                  </p>
                  <div className="mt-5 flex items-baseline gap-x-1.5">
                    <span className="text-5xl font-extrabold tracking-tight text-slate-900 font-display">
                      <NumberFlow
                        value={
                          isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                        }
                        format={{
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }}
                        transformTiming={{
                          duration: 500,
                          easing: "ease-out",
                        }}
                        willChange
                        className="tabular-nums"
                      />
                    </span>
                    <span className="text-sm font-medium text-slate-600">
                      / {plan.period}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {isMonthly ? "ditagih bulanan" : "ditagih tahunan"}
                  </p>

                  <p className="mt-4 text-xs leading-relaxed text-slate-600 font-medium border-b border-slate-200/80 pb-5">
                    {plan.description}
                  </p>

                  <ul className="mt-5 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm font-medium text-slate-800">
                        <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                        <span className="text-left">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href={plan.href}
                    className={cn(
                      "w-full py-3.5 px-6 rounded-full font-bold text-sm text-center block transition-all duration-300 shadow-md",
                      plan.isPopular
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-500/25 hover:shadow-lg"
                        : "bg-white border border-slate-200/90 text-slate-900 hover:bg-slate-50 hover:border-slate-300"
                    )}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);

  useEffect(() => {
    setIsMobileNav(window.innerWidth < 768);
    const handleResize = () => setIsMobileNav(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      const sections = ["home", "about", "pricing", "faq", "contact"];
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

  const handleSparklesClick = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    const demoElement = document.getElementById("ai-demo");
    if (demoElement) {
      const navbarHeight = 80;
      const elementPosition = demoElement.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
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
            maxWidth: isScrolled ? 760 : 1920,
            paddingLeft: isScrolled ? 24 : (isMobileNav ? 20 : 80),
            paddingRight: isScrolled ? 24 : (isMobileNav ? 20 : 80),
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
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            <KanvexaLogo src="/img/logo2-purple.png" imgClassName="h-7 w-auto object-contain" />
          </span>
          <div className="hidden md:flex items-center gap-6">
            {[
              { name: "Home", id: "home" },
              { name: "About", id: "about" },
              { name: "Pricing", id: "pricing" },
              { name: "FAQ", id: "faq" },
              { name: "Contact", id: "contact" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleScroll(e, link.id)}
                className={`text-sm font-medium transition-colors relative py-1 ${activeSection === link.id
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
          <div className="flex items-center gap-3">
            <Link href="/signup" className="hidden md:block">
              <LiquidMetalButton label="Get Started" />
            </Link>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border/60 bg-background/60 backdrop-blur-sm text-foreground"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              )}
            </button>
          </div>
        </motion.nav>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden mx-4 mt-2 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-2xl shadow-xl p-5 flex flex-col gap-2"
          >
            {[
              { name: "Home", id: "home" },
              { name: "About", id: "about" },
              { name: "Pricing", id: "pricing" },
              { name: "FAQ", id: "faq" },
              { name: "Contact", id: "contact" },
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => { handleScroll(e, link.id); setMobileMenuOpen(false); }}
                className={`block text-base font-medium py-2.5 px-3 rounded-xl transition-all ${activeSection === link.id
                    ? "text-primary bg-primary/5 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                {link.name}
              </a>
            ))}
            <div className="mt-2 pt-3 border-t border-border/50">
              <Link href="/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                <LiquidMetalButton label="Get Started" />
              </Link>
            </div>
          </motion.div>
        )}
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
              Generative Kanban AI v1.0 ✨
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight text-foreground max-w-3xl"
            >
              Ubah Ide Menjadi <span className="font-display italic text-violet-600 dark:text-violet-400">Alur Kerja</span> Instan
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-center text-base sm:text-lg md:text-xl text-muted-foreground max-w-[650px] leading-relaxed font-body"
            >
              Otomatiskan pekerjaan administratif dengan AI yang mampu memahami, memecah, dan menyusun tugas secara presisi | sehingga tim Anda bisa fokus pada hal yang paling berdampak.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-3.5 z-20"
            >
              <Link href="/signup">
                <LiquidMetalButton label="Uji Coba Gratis" colorTheme="purple" />
              </Link>
              <a href="#pricing" onClick={(e) => handleScroll(e, "pricing")}>
                <LiquidMetalButton label="Beralih ke Pro" badge="Diskon 20%" />
              </a>
            </motion.div>
          </motion.div>

          {/* 3D Locomotive Scroll Parallax Dashboard Card */}
          <motion.div
            id="ai-demo"
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
          <motion.span variants={fadeUp} className="rn-eyebrow">TESTIMONIAL</motion.span>
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
      <PricingSection />

      {/* ===================== FAQ SECTION ===================== */}
      <AccordionComponent />

      {/* ===================== FINAL CTA ===================== */}
      <section id="contact" className="relative z-10 px-6 md:px-12 lg:px-20 py-24 md:py-32 text-center overflow-hidden min-h-[520px] flex flex-col justify-center" onMouseMove={handleHeroMouseMove}>
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-90"
        >
          <source
            src="/img/Video_orbit.mp4"
            type="video/mp4"
          />
        </video>

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
          className="max-w-3xl mx-auto relative z-10 flex flex-col items-center text-center"
        >
          <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-700 bg-slate-100 border border-slate-200/80 rounded-full shadow-xs mb-4">
            CONTACT
          </motion.span>
          <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight text-foreground leading-[1.05]">
            Satu Papan untuk Semua Alat Kerja
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 max-w-xl mx-auto text-base md:text-lg text-muted-foreground font-body leading-relaxed font-normal">
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
              className="rounded-full px-7 py-4 text-sm md:text-base font-medium font-body border border-border/80 bg-white text-foreground hover:bg-slate-50 transition-colors shadow-sm"
            >
              Hubungi Kami
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="relative z-10 px-6 md:px-12 lg:px-20 py-12 border-t border-gray-600/40 bg-[#757575] text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center">
              <KanvexaLogo src="/img/logo2-transparent.png" imgClassName="h-8 w-auto object-contain" />
            </div>
            <p className="text-sm text-gray-200 mt-2 max-w-xs font-body font-normal">
              Otomatiskan pekerjaan administratif dengan AI yang mampu memahami, memecah, dan menyusun tugas secara presisi.
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
                className="text-sm text-gray-200 hover:text-white transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/BinnDevv7941"
              target="_blank"
              rel="noopener noreferrer"
              title="X (Twitter) @BinnDevv7941"
              className="text-gray-200 hover:text-white transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/chocobinnz_/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram @chocobinnz_"
              className="text-gray-200 hover:text-white transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <Linkedin className="h-4 w-4 text-gray-200 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
        <p className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-500/50 text-xs text-gray-300 font-mono">
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
