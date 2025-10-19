'use client';

import { useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, PieChart } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import { useMemo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { ArrowUp, ArrowDown, Book, Clapperboard, Gamepad2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const COLORS = ['#0ea5e9', '#f97316', '#84cc16'];

export default function UserStatsPage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  const userReviewsQuery = useMemoFirebase(
    () => user && firestore && query(collection(firestore, 'reviews'), where('authorId', '==', user.uid)),
    [user, firestore]
  );
  
  const { data: reviews, isLoading: reviewsLoading } = useCollection<Review>(userReviewsQuery);

  const stats = useMemo(() => {
    if (!reviews) return null;

    const totalReviews = reviews.length;
    const totalUpvotes = reviews.reduce((sum, r) => sum + (r.upvotes || 0), 0);
    const totalDownvotes = reviews.reduce((sum, r) => sum + (r.downvotes || 0), 0);
    
    const categoryCounts = reviews.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = [
        { name: 'Movies', value: categoryCounts.movie || 0, icon: Clapperboard },
        { name: 'Books', value: categoryCounts.book || 0, icon: Book },
        { name: 'Games', value: categoryCounts.game || 0, icon: Gamepad2 },
    ].filter(d => d.value > 0);

    return {
      totalReviews,
      totalUpvotes,
      totalDownvotes,
      categoryData,
    };
  }, [reviews]);
  
  const isLoading = reviewsLoading || isUserLoading;

  if (isLoading || !user) {
      return (
          <div className="container mx-auto py-8">
               <div className="mb-8">
                    <Skeleton className="h-10 w-1/4" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-1/2" />
                                <Skeleton className="h-4 w-full mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[300px] w-full" />
                        </CardContent>
                    </Card>
                </div>
          </div>
      )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">My Statistics</h1>
        <p className="text-muted-foreground">A summary of your review activity on RateHub.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalReviews}</div>
                <p className="text-xs text-muted-foreground">You've shared your opinion {stats?.totalReviews} times!</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Upvotes</CardTitle>
                <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUpvotes}</div>
                <p className="text-xs text-muted-foreground">Thumbs up from the community.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Downvotes</CardTitle>
                <ArrowDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalDownvotes}</div>
                <p className="text-xs text-muted-foreground">Feedback from the community.</p>
            </CardContent>
        </Card>
      </div>

       <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline">Category Breakdown</CardTitle>
                    <CardDescription>How your reviews are distributed across categories.</CardDescription>
                </CardHeader>
                <CardContent>
                {stats?.categoryData && stats.categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                            <Pie
                                data={stats.categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {stats.categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>No reviews yet to show statistics.</p>
                    </div>
                )}
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
