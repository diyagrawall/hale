import type { Metadata, Viewport } from "next";
import { Fraunces, Figtree, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const serif = Fraunces({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "500", "600"] });
const sans = Figtree({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const deva = Noto_Sans_Devanagari({ variable: "--font-deva", subsets: ["devanagari"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Hale: help for every animal, fast",
  description:
    "Hale is a super app for animal care: emergency help for strays and pets, pet health reminders, grooming, food, events, and verified fundraising.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F5EF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${deva.variable}`}>
      <body>{children}</body>
    </html>
  );
}
