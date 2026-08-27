import type { Metadata } from "next";
import { Inter, Source_Serif_4, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Styrene B stand-in (UI sans)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Tiempos stand-in (editorial serif for display & reading)
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

// numerals / code only
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Markov Lab — Interactive Markov Chain Laboratory",
  description:
    "Build, simulate and dissect Markov chains: force-directed state graphs, live random walks, convergence analytics and a text-generation playground.",
  keywords: ["Markov chains", "probability", "simulation", "stationary distribution", "visualization"],
  openGraph: {
    title: "Markov Lab — Interactive Markov Chain Laboratory",
    description:
      "Build, simulate and dissect Markov chains: force-directed state graphs, live random walks, convergence analytics and a text-generation playground.",
    url: "https://github.com/dryitfu-code/markov-lab",
    siteName: "Markov Lab",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Markov Lab — paper-and-ink Markov chain laboratory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markov Lab — Interactive Markov Chain Laboratory",
    description: "Build, simulate and dissect Markov chains in your browser.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sourceSerif.variable} ${geistMono.variable} bg-background font-sans text-foreground antialiased`}
      >
        {children}
        {/* Sonner toaster, styled to the paper-and-ink system: paper surface,
            ink text, hairline border, clay icons — flat, no glow. */}
        <Toaster
          position="bottom-right"
          gap={8}
          toastOptions={{
            style: {
              background: "#FAF9F5",
              color: "#1F1E1D",
              border: "1px solid #DDD9CC",
              borderRadius: "8px",
              fontFamily: "var(--font-inter)",
              fontSize: "13px",
              lineHeight: "1.45",
              boxShadow: "0 4px 14px rgba(25, 25, 25, 0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
