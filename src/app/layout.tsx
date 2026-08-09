import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kanvexa | Tempat Ide Menjadi Nyata",
  description: "Kanban board kolaboratif dengan AI breakdown tugas otomatis.",
  icons: {
    icon: "/img/logo3.png",
    shortcut: "/img/logo3.png",
    apple: "/img/logo3.png",
  },
};

const scriptCode = `
  (function() {
    window.addEventListener('error', function(e) {
      if (
        (e.filename && e.filename.indexOf('chrome-extension://') !== -1) ||
        (e.message && e.message.indexOf('Cannot redefine property: ethereum') !== -1)
      ) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);

    window.addEventListener('unhandledrejection', function(e) {
      if (
        e.reason &&
        e.reason.message &&
        e.reason.message.indexOf('Cannot redefine property: ethereum') !== -1
      ) {
        e.preventDefault();
      }
    }, true);

    try {
      var _eth = window.ethereum;
      Object.defineProperty(window, 'ethereum', {
        get: function() { return _eth; },
        set: function(v) { _eth = v; },
        configurable: true,
        enumerable: true
      });
    } catch(err) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <Script
          id="suppress-extension-errors"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: scriptCode }}
        />
        {children}
      </body>
    </html>
  );
}
