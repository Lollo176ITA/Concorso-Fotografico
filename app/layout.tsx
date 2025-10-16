import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Concorso Fotografico 2025",
  description: "Partecipa al concorso fotografico e mostra il tuo talento",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
