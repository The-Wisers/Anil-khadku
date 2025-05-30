import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Anton } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const anton = Anton({
  variable: '--font-anton',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  title: "Anil Khadku's Revenge",
  description: 'A fun game to interact with Anil Khadku!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
