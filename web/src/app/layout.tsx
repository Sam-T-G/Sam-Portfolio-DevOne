import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import "./console-filter"; // Suppress React DevTools semver error in development

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
  title: "Samuel Gerungan | ML Engineer & Full-Stack Developer",
  description: "Computer Science student specializing in machine learning and full-stack development. Experience fine-tuning LLMs (GPT-OSS 20B), building real-time systems, and creating AI applications with Google Gemini and Claude.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
