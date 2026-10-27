import { Toaster } from "@/shared/ui/sonner";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../shared/styles/globals.css";
export const metadata: Metadata = {
  title: "Alinha · Seu próximo passo profissional",
  description:
    "Compare seu currículo com vagas e apresente melhor sua experiência real.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
