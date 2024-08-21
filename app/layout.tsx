import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = Inter({
  subsets: ["latin"],
  weight: ["500", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Vaxtrace",
  description: "Sistema digital de vacunacion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={fontSans.className}>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
