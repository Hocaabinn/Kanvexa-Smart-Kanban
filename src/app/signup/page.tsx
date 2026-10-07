"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { KanvexaLogo } from "@/components/ui/KanvexaLogo";

const images = [
  "/img/starry_night.png",
  "/img/purple_landscape.png",
  "/img/purple_cat.png",
  "/img/purple_fuji.png",
];

const prompts = [
  "Buat alur kerja otomatis untuk peluncuran produk baru dengan Generative Kanban AI",
  "Rencanakan jadwal acara kampus bulan depan lengkap dengan pembagian tugas panitia",
  "Kelola proyek perancangan ulang sistem dari fase perencanaan hingga peluncuran",
  "Otomatiskan pemecahan tugas administratif dan susun prioritas secara presisi",
];

export default function SignupPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Anda harus menyetujui Syarat Layanan dan Kebijakan Privasi.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const fullName = `${firstName} ${lastName}`.trim();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName },
        },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setSubmitted(true);
    } catch (err: any) {
      setLoading(false);
      setError(
        err?.message ||
          "Gagal terhubung ke layanan autentikasi. Periksa koneksi internet Anda."
      );
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
        <div className="w-full max-w-[440px] text-center rounded-2xl bg-white p-8 shadow-xl border border-violet-100">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">
            Akun Berhasil Dibuat!
          </h1>
          <p className="mb-6 text-sm text-slate-600 leading-relaxed">
            Selamat, akun Anda dengan email <strong className="text-violet-600">{email}</strong> telah berhasil didaftarkan. Silakan masuk untuk mulai menggunakan Kanvexa.
          </p>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 active:scale-[0.99]"
          >
            Masuk Sekarang
          </Link>
        </div>
      </div>
    );
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
              Ruang kerja Kanban AI cerdas untuk tim visioner & pembuat karya
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
          <div className="mx-auto w-full max-w-[480px]">
            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Buat Akun Kanvexa
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Mulai gratis tanpa kartu kredit. Kelola alur kerja AI dalam hitungan detik.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldInput
                  label="Nama Depan"
                  placeholder="Andi"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  required
                />
                <FieldInput
                  label="Nama Belakang"
                  placeholder="Pratama"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  type="text"
                  required
                />
              </div>

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
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
              />

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                  <p>{error}</p>
                  {error.includes("sudah terdaftar") && (
                    <div className="mt-2.5 pt-2 border-t border-red-100 flex items-center justify-between">
                      <span>Sudah punya akun?</span>
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-1 font-bold text-violet-700 underline underline-offset-2 hover:text-violet-900"
                      >
                        Buka Halaman Masuk <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-600">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span>
                    Dengan membuat akun, Anda menyetujui{" "}
                    <a
                      href="#"
                      className="font-bold text-violet-600 underline underline-offset-2 hover:text-violet-700"
                    >
                      Syarat Layanan
                    </a>{" "}
                    dan{" "}
                    <a
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center justify-center text-slate-400 hover:text-violet-600 transition-colors p-1"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                      href="#"
                      className="font-bold text-violet-600 underline underline-offset-2 hover:text-violet-700"
                    >
                      Kebijakan Privasi
                    </a>{" "}
                    Kanvexa.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 text-base font-bold text-white shadow-lg shadow-violet-500/30 transition-all hover:bg-violet-700 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? "Membuat Akun..." : "Daftar Sekarang"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-slate-600">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-bold text-violet-600 underline underline-offset-2 hover:text-violet-700"
              >
                Masuk ke akun
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
  minLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
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
          minLength={minLength}
          className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 pr-2"
        />
      </div>
    </div>
  rightElement,
  );
}
  rightElement?: React.ReactNode;
        {rightElement}
