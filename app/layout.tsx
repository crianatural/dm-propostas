import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DM Propostas",
  description: "Gerador de propostas comerciais da DM Construções.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <html lang="pt-BR">
      <head><link rel="icon" href={`${basePath}/favicon.svg`} /></head>
      <body>{children}</body>
    </html>
  );
}
