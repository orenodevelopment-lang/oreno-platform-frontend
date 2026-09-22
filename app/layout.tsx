import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const raleway = localFont({
  src: [
    { path: "./fonts/raleway-200.ttf", weight: "200", style: "normal" },
    { path: "./fonts/raleway-200-italic.ttf", weight: "200", style: "italic" },
    { path: "./fonts/raleway-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/raleway-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/raleway-700.ttf", weight: "700", style: "normal" },
    { path: "./fonts/raleway-900.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-raleway",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/poppins-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/poppins-600.ttf", weight: "600", style: "normal" },
    { path: "./fonts/poppins-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oreno — Hiring skilled talent made easy",
  description: "Hire carefully vetted developers, AI people and designers across Africa.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${raleway.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
