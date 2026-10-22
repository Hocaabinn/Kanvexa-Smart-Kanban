"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { KanvexaLogo } from "@/components/ui/KanvexaLogo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      // Supabase sets the session via the callback route exchangeCodeForSession
      if (!data.session) {
        // If no session found yet, wait briefly or listen to auth state
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            setCheckingSession(false);
          }
        });
        setTimeout(() => {
          setCheckingSession(false);
        }, 1500);
        return () => {
          authListener.subscription.unsubscribe();
        };
      } else {
        setCheckingSession(false);
      }
    }
    checkAuth();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setError("Kata sandi baru minimal harus 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Gagal memperbarui kata sandi.");
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Kata Sandi Diperbarui!
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Kata sandi akun Anda berhasil diganti. Anda akan dialihkan otomatis ke dashboard...
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700 transition-all"
                >
                  Buka Dashboard Sekarang
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Atur Kata Sandi Baru
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                  Silakan masukkan kata sandi baru untuk akun Kanvexa Anda.
                </p>
              </div>

              {checkingSession ? (
                <div className="py-8 text-center text-sm font-medium text-slate-500">
                  Memverifikasi sesi pemulihan Anda...
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Minimal 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-violet-600 p-0.5"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Ulangi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Ketik ulang kata sandi"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700 active:scale-[0.99] disabled:opacity-50 transition-all"
                  >
                    {loading ? "Menyimpan Kata Sandi..." : "Simpan Kata Sandi Baru"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
