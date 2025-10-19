'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Clapperboard, Book, Gamepad2 } from 'lucide-react';
import UserNav from './user-nav';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function Header() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const navItems = [
    { href: '/reviews?category=movie', label: 'Movies', icon: Clapperboard },
    { href: '/reviews?category=book', label: 'Books', icon: Book },
    { href: '/reviews?category=game', label: 'Games', icon: Gamepad2 },
  ];

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/reviews?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Clapperboard className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block font-headline text-lg">
              RateHub
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                <Clapperboard className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline text-lg">RateHub</span>
              </Link>
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-2 text-lg"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 sm:flex-initial sm:w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          {!isUserLoading && user && (
            <Button asChild>
              <Link href="/reviews/new">New Review</Link>
            </Button>
          )}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
