import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wealthtracker-8hc.pages.dev"),
  title: "The Inequality Calculator — Billionaire Passive Income in Real Time",
  description:
    "Watch the combined passive income of the world's 10 richest people tick up in real time.",
  openGraph: {
    title: "The Inequality Calculator",
    description:
      "Watch the combined passive income of the world's 10 richest people tick up in real time.",
    url: "https://wealthtracker-8hc.pages.dev",
    siteName: "The Inequality Calculator",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
