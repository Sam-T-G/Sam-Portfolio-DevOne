import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Samuel Gerungan | Full-Stack Developer & AI Enthusiast",
  description: "Computer Science student at Riverside City College specializing in full-stack development, AI integration, and competitive programming. Research assistant exploring runtime optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const t = localStorage.getItem('theme'); const m = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; if (t === 'dark' || (!t && m)) { document.documentElement.classList.add('dark'); } else { document.documentElement.classList.remove('dark'); } } catch (e) {} })();`,
          }}
        />
        <header className="sticky top-0 z-50 border-b-2 border-[var(--ink-black)] bg-[var(--bg-paper)]">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <a 
              href="#home" 
              className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-[var(--ink-black)] transition-opacity hover:opacity-70"
            >
              Samuel Gerungan
            </a>
            <div className="flex items-center gap-8">
              <a href="#home" className="font-[family-name:var(--font-body)] text-sm font-semibold uppercase tracking-wide text-[var(--charcoal)] transition-colors hover:text-[var(--accent-teal)]">Home</a>
              <a href="#projects" className="font-[family-name:var(--font-body)] text-sm font-semibold uppercase tracking-wide text-[var(--charcoal)] transition-colors hover:text-[var(--accent-teal)]">Projects</a>
              <a href="#skills" className="font-[family-name:var(--font-body)] text-sm font-semibold uppercase tracking-wide text-[var(--charcoal)] transition-colors hover:text-[var(--accent-teal)]">Skills</a>
              <a href="#contact" className="font-[family-name:var(--font-body)] text-sm font-semibold uppercase tracking-wide text-[var(--charcoal)] transition-colors hover:text-[var(--accent-teal)]">Contact</a>
              <ThemeToggle />
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
