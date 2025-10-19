'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import ReviewCard from '@/components/review-card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { useCollection, useFirebase, useMemoFirebase, useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, limit, orderBy, query, where } from 'firebase/firestore';
import type { Review } from '@/lib/types';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();

  // Memoize queries
  const trendingQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'reviews'), orderBy('upvotes', 'desc'), limit(4)), [firestore]);
  const movieQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'reviews'), where('category', '==', 'movie'), limit(10)), [firestore]);
  const bookQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'reviews'), where('category', '==', 'book'), limit(10)), [firestore]);
  const gameQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'reviews'), where('category', '==', 'game'), limit(10)), [firestore]);

  // Fetch data
  const { data: trendingReviews, isLoading: trendingLoading } = useCollection<Review>(trendingQuery);
  const { data: movieReviews, isLoading: movieLoading } = useCollection<Review>(movieQuery);
  const { data: bookReviews, isLoading: bookLoading } = useCollection<Review>(bookQuery);
  const { data: gameReviews, isLoading: gameLoading } = useCollection<Review>(gameQuery);
  
  const heroImage = placeholderImages.find(p => p.id === 'hero-background');

  const renderSkeletonCarousel = () => (
    <div className="flex space-x-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-1">
          <Skeleton className="h-[450px] w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[70vh] text-primary-foreground overflow-hidden">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
          {user ? (
             <>
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
                Welcome back, {user.displayName || 'critic'}!
              </h1>
              <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/90">
                Ready to review what's new or see what others are saying?
              </p>
             </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
                Discover Your Next Favorite
              </h1>
              <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/90">
                Join the RateHub community to review, discuss, and find the best in movies, books, and games.
              </p>
            </>
          )}

          <div className="mt-8 flex gap-4">
            {isUserLoading ? (
              <>
                <Skeleton className="h-11 w-40" />
                <Skeleton className="h-11 w-32" />
              </>
            ) : (
               <>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/reviews">Explore Reviews</Link>
                </Button>
                {!user && (
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/signup">Join Now</Link>
                  </Button>
                )}
               </>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Trending Reviews</h2>
            <Button variant="link" asChild>
              <Link href="/reviews">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingLoading || !trendingReviews ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[450px] w-full" />)
            ) : (
              trendingReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-card">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Latest Movies</h2>
            <Button variant="link" asChild>
              <Link href="/reviews?category=movie">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {movieLoading || !movieReviews ? renderSkeletonCarousel() : (
            <Carousel opts={{ align: 'start', loop: false }} className="w-full">
              <CarouselContent>
                {movieReviews.map((review) => (
                  <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1">
                      <ReviewCard review={review} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          )}
        </div>
      </section>
      
      <section className="py-12 md:py-20">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Top Rated Books</h2>
            <Button variant="link" asChild>
              <Link href="/reviews?category=book">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {bookLoading || !bookReviews ? renderSkeletonCarousel() : (
            <Carousel opts={{ align: 'start', loop: false }} className="w-full">
              <CarouselContent>
                {bookReviews.map((review) => (
                  <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1">
                      <ReviewCard review={review} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm-flex" />
            </Carousel>
          )}
        </div>
      </section>

      <section className="py-12 md:py-20 bg-card">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline">New Games</h2>
             <Button variant="link" asChild>
              <Link href="/reviews?category=game">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {gameLoading || !gameReviews ? renderSkeletonCarousel() : (
            <Carousel opts={{ align: 'start', loop: false }} className="w-full">
              <CarouselContent>
                {gameReviews.map((review) => (
                  <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1">
                      <ReviewCard review={review} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          )}
        </div>
      </section>
    </div>
  );
}
