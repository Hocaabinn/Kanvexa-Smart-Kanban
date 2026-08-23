"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { KanvexaLogo } from "@/components/ui/KanvexaLogo";

const images = [
  "/img/starry_night.png",
  "/img/purple_landscape.png",
  "/img/purple_cat.png",
  "/img/purple_fuji.png",
];

const prompts = [
  "Kelola papan Kanban tim dan lacak progres pekerjaan secara real-time",
  "Otomatiskan delegasi tugas dengan asisten Generative AI cerdas",
  "Integrasikan alur kerja tim dari ide awal hingga eksekusi akhir",
  "Tingkatkan produktivitas dengan antarmuka Kanban modern & presisi",
];

export default function LoginPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setLoading(false);
      setError(
        err?.message ||
          "Gagal terhubung ke layanan autentikasi. Periksa koneksi internet Anda."
      );
    }
  }

  return (
    <section className="min-h-screen bg-slate-50 p-3 text-slate-900 antialiased">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        {/* Left Visual Panel - Cerah Bright Purple Gradient */}
        <div className="relative flex min-h-[640px] justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 px-7 py-12 text-white shadow-xl sm:px-10 lg:min-h-0 lg:py-16 xl:py-20">
          {/* Ambient Soft Glowing Orbs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl" />

          <div className="relative z-10 flex w-full max-w-[500px] flex-col items-center">
            {/* Logo Header */}
            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-90 drop-shadow-sm"
            >
              <KanvexaLogo src="/img/logo2-transparent.png" imgClassName="h-10 w-auto object-contain" />
            </Link>

            {/* Carousel Tiles */}
            <div className="relative mt-8 grid w-full grid-cols-[1.55fr_1fr] gap-2 rounded-xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-violet-600/80 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-indigo-600/80 to-transparent" />
              <ImageTile
                src={images[0]}
                active={activeIndex === 0}
                className="row-span-2 h-[240px]"
              />
              <ImageTile
                src={images[1]}
                active={activeIndex === 1}
                className="h-[116px]"
              />
              <ImageTile
                src={images[3]}
                active={activeIndex === 3}
                className="h-[116px]"
              />
              <ImageTile
                src={images[2]}
                active={activeIndex === 2}
                className="col-span-2 h-[115px]"
              />
            </div>

            {/* Bright Glassmorphic Prompt Preview Box */}
            <div className="mt-6 w-full rounded-2xl border border-white/30 bg-white/15 px-5 py-4 shadow-lg backdrop-blur-md">
              <div className="flex items-end gap-4">
                <p className="line-clamp-3 flex-1 text-xs leading-5 text-white/95">
                  <span className="font-bold text-white underline underline-offset-2">
                    /kanvexa ai
                  </span>{" "}
                  {prompts[activeIndex]}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) => (prev + 1) % prompts.length)
                  }
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-violet-700 shadow-md transition-all hover:bg-white/90 hover:scale-105 active:scale-95"
                  aria-label="Next prompt"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

            <p className="mt-7 max-w-[320px] text-center text-xl font-bold leading-snug text-white drop-shadow-sm">
              Selamat datang kembali di ruang kerja produktivitas Anda
            </p>

            {/* Carousel Indicators */}
            <div className="mt-auto flex gap-2 pb-4 pt-6">
              {prompts.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={
                    activeIndex === index
                      ? "h-1.5 w-8 rounded-full bg-white transition-all duration-300 shadow"
                      : "h-1.5 w-3 rounded-full bg-white/40 transition-all duration-300 hover:bg-white/70"
                  }
                  aria-label={`Lihat gambar ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Panel - Bright & Clean White */}
        <div className="flex min-h-[640px] items-center justify-center rounded-2xl bg-white px-6 py-10 shadow-sm border border-violet-100/60 sm:px-10 lg:min-h-0 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Selamat Datang Kembali
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Masuk untuk melanjutkan ke papan proyek Kanvexa Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldInput
                label="Alamat Email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />

              <FieldInput
                label="Kata Sandi"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 text-base font-bold text-white shadow-lg shadow-violet-500/30 transition-all hover:bg-violet-700 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Masuk ke Akun"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-slate-600">
              Belum memiliki akun?{" "}
              <Link
                href="/signup"
                className="font-bold text-violet-600 underline underline-offset-2 hover:text-violet-700"
              >
                Daftar gratis sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImageTile({
  src,
  active,
  className,
}: {
  src: string;
  active: boolean;
  className: string;
}) {
  return (
    <div
      className={`${className} relative overflow-visible rounded-xl ${active ? "z-10" : "z-0"}`}
    >
      <img
        src={src}
        alt="Kanvexa AI visual"
        className={`h-full w-full rounded-xl object-cover shadow-sm transition-all duration-700 ${active ? "opacity-100 scale-[1.02]" : "opacity-50"}`}
      />
      <FocusCorners active={active} />
    </div>
  );
}

function FocusCorners({ active }: { active: boolean }) {
  const baseClass = `pointer-events-none absolute h-4 w-4 border-white transition-all duration-500 ease-out ${active ? "translate-x-0 translate-y-0 opacity-100" : "opacity-0"}`;

  return (
    <>
      <div
        className={`${baseClass} -left-2 -top-2 border-l-2 border-t-2 ${active ? "" : "-translate-x-2 -translate-y-2"}`}
      />
      <div
        className={`${baseClass} -right-2 -top-2 border-r-2 border-t-2 ${active ? "" : "translate-x-2 -translate-y-2"}`}
      />
      <div
        className={`${baseClass} -bottom-2 -left-2 border-b-2 border-l-2 ${active ? "" : "-translate-x-2 translate-y-2"}`}
      />
      <div
        className={`${baseClass} -bottom-2 -right-2 border-b-2 border-r-2 ${active ? "" : "translate-x-2 translate-y-2"}`}
      />
    </>
  );
}

function FieldInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-xs font-bold text-slate-700">
        {label}
      </label>
      <div className="relative flex h-11 items-center rounded-xl border border-violet-100 bg-violet-50/40 px-3.5 transition-all focus-within:border-violet-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/20">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
