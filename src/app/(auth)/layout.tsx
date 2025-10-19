import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clapperboard } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images.json';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authImage = placeholderImages.find(p => p.id === 'hero-background');

  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2 xl:min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
            {children}
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {authImage && (
            <Image
                src={authImage.imageUrl}
                alt="Abstract image"
                width="1920"
                height="1080"
                className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                data-ai-hint={authImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"/>
        <div className="absolute bottom-8 left-8 right-8 p-4 bg-black/50 backdrop-blur-sm rounded-lg text-white">
            <h3 className="font-headline text-2xl font-bold">Your opinion matters.</h3>
            <p className="mt-2 text-sm">Join a community of critics and enthusiasts. Share your voice and discover new favorites.</p>
        </div>
      </div>
    </div>
  );
}
