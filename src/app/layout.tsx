import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kanvexa — Satu kalimat, langsung jadi rencana kerja",
  description: "Kanban board kolaboratif dengan AI breakdown tugas otomatis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
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
            `,
          }}
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
