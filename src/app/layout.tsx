
import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a more common default
import { Anton } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Changed from geist to inter
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
      <body className={`${inter.variable} ${anton.variable} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
