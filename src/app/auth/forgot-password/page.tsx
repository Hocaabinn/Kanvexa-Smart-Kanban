"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { KanvexaLogo } from "@/components/ui/KanvexaLogo";
import { Turnstile } from "@/components/ui/Turnstile";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Silakan selesaikan verifikasi keamanan (CAPTCHA) terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
        captchaToken: captchaToken || undefined,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(
        err?.message ||
          "Gagal mengirim instruksi pemulihan. Periksa koneksi internet Anda."
      );
    }
  }

  return (
    <section className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-slate-900 antialiased">
      <div className="w-full max-w-md">
        {/* Brand Logo Header */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <KanvexaLogo
              src="/img/logo2-transparent.png"
              imgClassName="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-violet-100/60">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Email Terkirim!
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Kami telah mengirimkan tautan pemulihan kata sandi ke{" "}
                <span className="font-semibold text-slate-800">{email}</span>. Silakan periksa kotak masuk (inbox) atau folder spam Anda.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700 transition-all"
                >
                  Kembali ke Halaman Masuk
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors mb-3"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Masuk
                </Link>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Lupa Kata Sandi?
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Masukkan alamat email yang terdaftar pada akun Kanvexa Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="nama email anda@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                    {error}
                  </div>
                )}

                <div className="pt-1">
                  <Turnstile
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => setCaptchaToken(null)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700 active:scale-[0.99] disabled:opacity-50 transition-all"
                >
                  {loading ? "Mengirim Tautan..." : "Kirim Tautan Pemulihan"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
