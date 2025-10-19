'use client';

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, Query, DocumentData } from "firebase/firestore";
import type { Review } from "@/lib/types";

import ReviewCard from "@/components/review-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ReviewsPage() {
  const { firestore } = useFirebase();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get filter values from URL
  const category = searchParams.get('category') || 'all';
  const genre = searchParams.get('genre') || 'all';
  const rating = searchParams.get('rating') || 'all';
  const year = searchParams.get('year') || 'all';
  const sort = searchParams.get('sort') || 'createdAt_desc';
  const searchTerm = searchParams.get('search') || '';

  const [currentSearch, setCurrentSearch] = useState(searchTerm);
  
  // SIMPLIFIED QUERY: Only apply sorting. All filtering will happen client-side.
  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    let q: Query<DocumentData> = collection(firestore, 'reviews');
    
    if (sort === 'rating_desc') {
        q = query(q, orderBy('rating', 'desc'));
    } else if (sort === 'upvotes_desc') {
        q = query(q, orderBy('upvotes', 'desc'));
    } else { 
        q = query(q, orderBy('createdAt', 'desc'));
    }

    return q;
  }, [firestore, sort]);

  const { data: reviewsData, isLoading: reviewsLoading } = useCollection<Review>(reviewsQuery);

  // CLIENT-SIDE FILTERING: Apply all filters here.
  const filteredReviews = useMemo(() => {
    if (!reviewsData) return [];
    
    return reviewsData.filter(review => {
        const categoryMatch = category === 'all' || review.category === category;
        const genreMatch = genre === 'all' || (review.genre && review.genre.toLowerCase() === genre.toLowerCase());
        const ratingMatch = rating === 'all' || review.rating >= Number(rating);
        const yearMatch = year === 'all' || review.year.toString() === year;
        const searchMatch = !searchTerm || review.title.toLowerCase().includes(searchTerm.toLowerCase());

        return categoryMatch && genreMatch && ratingMatch && yearMatch && searchMatch;
    });
  }, [reviewsData, category, genre, rating, year, searchTerm]);
  
  const genres = useMemo(() => reviewsData ? [...new Set(reviewsData.map(r => r.genre).filter(Boolean).sort())] : [], [reviewsData]);
  const years = useMemo(() => reviewsData ? [...new Set(reviewsData.map(r => r.year.toString()))].sort((a,b) => parseInt(b) - parseInt(a)) : [], [reviewsData]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleFilterChange('search', currentSearch);
  }
  
  // Update currentSearch when searchTerm from URL changes
  useEffect(() => {
    setCurrentSearch(searchTerm);
  }, [searchTerm]);

  const isLoading = reviewsLoading;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline mb-2">Explore Reviews</h1>
        <p className="text-muted-foreground">Find reviews for movies, books, and games.</p>
      </div>
      
      <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 mb-8 p-4 bg-card rounded-lg border">
         <Select onValueChange={(v) => handleFilterChange('category', v)} value={category}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="book">Books</SelectItem>
                <SelectItem value="game">Games</SelectItem>
            </SelectContent>
        </Select>
        <Select onValueChange={(v) => handleFilterChange('genre', v)} value={genre} disabled={genres.length === 0}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
        </Select>
         <Select onValueChange={(v) => handleFilterChange('rating', v)} value={rating}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
                <SelectItem value="1">1+ Star</SelectItem>
            </SelectContent>
        </Select>
         <Select onValueChange={(v) => handleFilterChange('year', v)} value={year} disabled={years.length === 0}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Any Year</SelectItem>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
        </Select>
        <Select onValueChange={(v) => handleFilterChange('sort', v)} value={sort}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="createdAt_desc">Newest</SelectItem>
                <SelectItem value="rating_desc">Top Rated</SelectItem>
                <SelectItem value="upvotes_desc">Most Popular</SelectItem>
            </SelectContent>
        </Select>
        <form onSubmit={handleSearch} className="relative w-full md:w-auto md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search by title..."
                className="pl-9 w-full"
                value={currentSearch}
                onChange={(e) => setCurrentSearch(e.target.value)}
            />
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
            [...Array(8)].map((_, i) => <Skeleton key={i} className="h-[450px] w-full" />)
        ) : filteredReviews && filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-16">
            <h3 className="text-xl font-semibold">No Reviews Found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
