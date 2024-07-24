import type { Metadata } from "next";
import { Pacifico as FontCursive } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

import { Roboto as FontSans } from 'next/font/google';

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
      <body className={fontSans.className}>{children}
        <Toaster />
      </body>
    </html>
  );
}
