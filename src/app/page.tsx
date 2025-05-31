"use client";
<script src="https://fpyf8.com/88/tag.min.js" data-zone="149965" async data-cfasync="false"></script>
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StickmanFigureIcon } from '@/components/icons/custom-icons'; // Using StickmanFigureIcon as a placeholder
import { Gamepad2 } from 'lucide-react';

export default function LandingPage() {
  return (
   <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-anton text-primary tracking-tight">
          Anil Khadku's Revenge
        </h1> 
        <p className="text-muted-foreground mt-2 text-lg md:text-xl">
          Get ready to unleash your creativity!
        </p>
      </header>

      <div className="mb-12 flex items-center justify-center w-48 h-48 md:w-64 md:h-64 bg-primary/10 rounded-full p-4 shadow-xl border-2 border-primary">
        <StickmanFigureIcon className="w-3/4 h-3/4 text-primary" />
      </div>

      <Link href="/game" passHref>
        <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl px-10 py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
          <Gamepad2 className="mr-3 h-7 w-7" />
          Play Game
        </Button>
      </Link>

      <footer className="absolute bottom-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Anil Khadku Entertainment. All rights reserved (not really).</p>
      </footer>
    </div>
  );
}
