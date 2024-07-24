import type { Metadata } from "next";
import { Pacifico as FontCursive } from 'next/font/google';
import './globals.css';

import { Roboto as FontSans } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = FontSans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});


const fontCursive = FontCursive({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-cursive',
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
      <ThemeProvider
            attribute="class"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      </body>
    </html>
  );
}
