import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "@/components/Provider";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CrestInEnglish",
  description: "A complete English learning platform designed for school students in Egypt. Whether you study in the Azhar or General Education system, our courses are fully aligned with your curriculum to help you succeed academically and communicate confidently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider>
        <body className={`${inter.variable} antialiased`}>
          <LanguageProvider>
          {children}
          </LanguageProvider>
          </body>
      </Provider>
    </html>
  );
}
