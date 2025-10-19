import { Clapperboard } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Clapperboard className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">RateHub</span>
          </div>
          <nav className="flex flex-wrap justify-center space-x-4 md:space-x-6 text-sm text-muted-foreground mb-4 md:mb-0">
            <Link href="#" className="hover:text-primary">About</Link>
            <Link href="#" className="hover:text-primary">Contact</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RateHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
