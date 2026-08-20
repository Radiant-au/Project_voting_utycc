import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { VoterLocaleProvider } from "@/features/exhibition/i18n";

export const metadata: Metadata = {
  title: "UTYCC Project Exhibition Voting",
  description: "University of Technology (Yatanarpon Cyber City) project exhibition voting portal."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body><VoterLocaleProvider>{children}</VoterLocaleProvider></body>
    </html>
  );
}
