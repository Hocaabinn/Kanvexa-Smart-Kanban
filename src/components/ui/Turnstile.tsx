"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (error?: unknown) => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "flexible" | "compact";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err?: unknown) => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export function Turnstile({
  siteKey,
  onVerify,
  onExpire,
  onError,
  theme = "light",
  className = "",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef<boolean>(false);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(() => {
    return typeof window !== "undefined" && Boolean(window.turnstile);
  });

  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const effectiveSiteKey =
    siteKey || process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !effectiveSiteKey) {
      return;
    }

    if (renderedRef.current && widgetIdRef.current) {
      return;
    }

    try {
      if (window.turnstile && containerRef.current) {
        containerRef.current.innerHTML = "";
        const id = window.turnstile.render(containerRef.current, {
          sitekey: effectiveSiteKey,
          callback: (token: string) => {
            onVerifyRef.current?.(token);
          },
          "expired-callback": () => {
            onExpireRef.current?.();
          },
          "error-callback": (err: unknown) => {
            onErrorRef.current?.(err);
          },
          theme,
          size: "normal",
        });
        widgetIdRef.current = id;
        renderedRef.current = true;
      }
    } catch (e) {
      console.error("Turnstile render error:", e);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
        renderedRef.current = false;
      }
    };
  }, [scriptLoaded, effectiveSiteKey, theme]);

  if (!effectiveSiteKey) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
        Site Key Turnstile belum diset di <code>.env.local</code> (NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY).
      </div>
    );
  }

  return (
    <div className={`my-2 flex justify-center ${className}`}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
    </div>
  );
}
