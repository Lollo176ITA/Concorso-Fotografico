import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scattiamo in Provincia - Concorso Fotografico",
  description: "Concorso fotografico della Città metropolitana di Roma Capitale. Racconta attraverso le immagini i borghi, paesaggi, mestieri e tradizioni del territorio metropolitano.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        {children}
        <Script src="/bootstrap-italia/js/bootstrap-italia.bundle.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
