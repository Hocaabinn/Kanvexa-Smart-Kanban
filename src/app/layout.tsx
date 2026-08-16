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
    // 1. Scrub browser extension attributes (Bitdefender bis_skin_checked, bis_size, etc.) before React hydration
    function scrubExtensionAttributes(root) {
      if (!root || root.nodeType !== 1) return;
      if (root.hasAttribute('bis_skin_checked')) root.removeAttribute('bis_skin_checked');
      if (root.hasAttribute('bis_size')) root.removeAttribute('bis_size');
      var targets = root.querySelectorAll('[bis_skin_checked], [bis_size]');
      for (var i = 0; i < targets.length; i++) {
        targets[i].removeAttribute('bis_skin_checked');
        targets[i].removeAttribute('bis_size');
      }
    }

    if (typeof document !== 'undefined') {
      scrubExtensionAttributes(document.documentElement);

      if (typeof MutationObserver !== 'undefined') {
        var observer = new MutationObserver(function(mutations) {
          for (var i = 0; i < mutations.length; i++) {
            var m = mutations[i];
            if (m.type === 'attributes' && (m.attributeName === 'bis_skin_checked' || m.attributeName === 'bis_size')) {
              m.target.removeAttribute(m.attributeName);
            } else if (m.type === 'childList') {
              for (var j = 0; j < m.addedNodes.length; j++) {
                scrubExtensionAttributes(m.addedNodes[j]);
              }
            }
          }
        });
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['bis_skin_checked', 'bis_size'],
          childList: true,
          subtree: true
        });
      }
    }

    // 2. Suppress console errors and warnings about hydration mismatches caused by browser extensions
    const originalError = console.error;
    console.error = function(...args) {
      const fullText = args.map(a => {
        if (typeof a === 'string') return a;
        if (a && typeof a === 'object') return a.message || a.stack || JSON.stringify(a);
        return String(a);
      }).join(' ');

      if (
        fullText.includes('hydration-mismatch') ||
        fullText.includes('Hydration failed') ||
        fullText.includes('did not match') ||
        fullText.includes('bis_skin_checked') ||
        fullText.includes('suppressHydrationWarning') ||
        fullText.includes('chrome-extension://') ||
        fullText.includes('M_ID')
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    window.addEventListener('error', function(e) {
      var errorStr = (e.filename || '') + ' ' + (e.message || '') + ' ' + (e.error && e.error.stack ? e.error.stack : '');
      if (
        errorStr.indexOf('chrome-extension://') !== -1 ||
        errorStr.indexOf('M_ID') !== -1 ||
        errorStr.indexOf('Cannot redefine property: ethereum') !== -1
      ) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);

    window.addEventListener('unhandledrejection', function(e) {
      var reasonStr = '';
      if (e.reason) {
        if (typeof e.reason === 'string') {
          reasonStr = e.reason;
        } else {
          reasonStr = (e.reason.stack || e.reason.message || '') + '';
        }
      }
      if (
        reasonStr.indexOf('chrome-extension://') !== -1 ||
        reasonStr.indexOf('M_ID') !== -1 ||
        reasonStr.indexOf('Cannot redefine property: ethereum') !== -1
      ) {
        e.stopImmediatePropagation();
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
