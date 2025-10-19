'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, FileText, Smile, Frown, Meh } from "lucide-react"
import SentimentChart from "@/components/admin/sentiment-chart"
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Review } from "@/lib/types";
import withAdminAuth from "@/components/auth/withAdminAuth";
import { useMemo } from "react";
import { format, subMonths } from "date-fns";

function AdminDashboardPage() {
    const { firestore } = useFirebase();

    const usersQuery = useMemoFirebase(() => firestore && collection(firestore, 'users'), [firestore]);
    const reviewsQuery = useMemoFirebase(() => firestore && collection(firestore, 'reviews'), [firestore]);

    const { data: usersData, isLoading: usersLoading } = useCollection(usersQuery);
    const { data: reviewsData, isLoading: reviewsLoading } = useCollection<Review>(reviewsQuery);

    const totalUsers = usersData?.length ?? 0;
    const totalReviews = reviewsData?.length ?? 0;
    
    const positiveReviews = reviewsData?.filter(r => r.rating >= 4).length ?? 0;
    const neutralReviews = reviewsData?.filter(r => r.rating === 3).length ?? 0;
    const negativeReviews = reviewsData?.filter(r => r.rating <= 2).length ?? 0;

    const sentimentData = useMemo(() => {
        if (!reviewsData) {
          // Generate skeleton data for the last 6 months
          return [...Array(6)].map((_, i) => {
            const d = subMonths(new Date(), 5 - i);
            return { month: format(d, 'MMM'), positive: 0, negative: 0, neutral: 0 };
          });
        }
    
        const sixMonthsAgo = subMonths(new Date(), 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
    
        const monthlyData: { [key: string]: { positive: number; negative: number; neutral: number } } = {};
    
        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
          const monthKey = format(subMonths(new Date(), i), 'yyyy-MM');
          monthlyData[monthKey] = { positive: 0, negative: 0, neutral: 0 };
        }
    
        reviewsData.forEach(review => {
          if (review.createdAt && review.createdAt.toDate) {
            const reviewDate = review.createdAt.toDate();
            if (reviewDate >= sixMonthsAgo) {
              const monthKey = format(reviewDate, 'yyyy-MM');
              if (review.rating >= 4) {
                monthlyData[monthKey].positive++;
              } else if (review.rating <= 2) {
                monthlyData[monthKey].negative++;
              } else {
                monthlyData[monthKey].neutral++;
              }
            }
          }
        });
    
        return Object.keys(monthlyData)
            .map(key => ({
                month: format(new Date(key + '-02'), 'MMM'), // Use day 02 to avoid timezone issues
                ...monthlyData[key],
            }))
            .sort((a, b) => new Date(a.month + ' 1, 2023').getTime() - new Date(b.month + ' 1, 2023').getTime()) // A bit of a hack to sort months correctly
            .slice(-6); // Ensure we only have the last 6 months
      }, [reviewsData]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{usersLoading ? '...' : totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                        Number of registered users.
                    </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Reviews
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{reviewsLoading ? '...' : totalReviews}</div>
                    <p className="text-xs text-muted-foreground">
                        Total reviews written.
                    </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                    <CardTitle>Community Sentiment</CardTitle>
                    <CardDescription>A look at review sentiment over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <SentimentChart data={sentimentData} />
                    </CardContent>
                </Card>
                <Card className="col-span-4 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Sentiment Overview</CardTitle>
                        <CardDescription>
                            Current breakdown of all reviews.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="flex items-center">
                            <Smile className="h-8 w-8 text-green-500 mr-4"/>
                            <div>
                                <p className="text-sm font-medium">Positive Reviews</p>
                                <p className="text-2xl font-bold">{reviewsLoading ? '...' : positiveReviews}</p>
                            </div>
                       </div>
                       <div className="flex items-center">
                            <Meh className="h-8 w-8 text-yellow-500 mr-4"/>
                            <div>
                                <p className="text-sm font-medium">Neutral Reviews</p>
                                <p className="text-2xl font-bold">{reviewsLoading ? '...' : neutralReviews}</p>
                            </div>
                       </div>
                       <div className="flex items-center">
                            <Frown className="h-8 w-8 text-red-500 mr-4"/>
                            <div>
                                <p className="text-sm font-medium">Negative Reviews</p>
                                <p className="text-2xl font-bold">{reviewsLoading ? '...' : negativeReviews}</p>
                            </div>
                       </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default withAdminAuth(AdminDashboardPage);
