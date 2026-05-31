import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "BAII — Bharat Advanced Innovation Incubator",
  description:
    "India's first applied innovation incubator. Real programmes, real labs, real outcomes.",
  keywords: ["BAII", "innovation", "India", "energy", "semiconductors", "incubator", "students"],
  openGraph: {
    title: "BAII — Bharat Advanced Innovation Incubator",
    description: "Real programmes. Real labs. Real outcomes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", dmSans.variable, playfair.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-navy-900 text-white">
        {children}
      </body>
    </html>
  );
}
