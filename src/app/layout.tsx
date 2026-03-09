import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://theinequalitycalculator.com"),
  title: "The Inequality Calculator — Billionaire Passive Income in Real Time",
  description:
    "Watch the combined passive income of the world's 10 richest people tick up in real time.",
  openGraph: {
    title: "The Inequality Calculator",
    description:
      "Watch the combined passive income of the world's 10 richest people tick up in real time.",
    url: "https://theinequalitycalculator.com",
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
        className={`${inter.variable} ${playfairDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
