'use client'

import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import StarRating from '@/components/star-rating';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import VoteButtons from '@/components/vote-buttons';
import CommentSection from '@/components/comment-section';
import AiSummarizer from '@/components/ai-summarizer';
import { useDoc, useFirebase, useMemoFirebase, useUser } from '@/firebase';
import type { Review, UserProfile } from '@/lib/types';
import { deleteDoc, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReviewDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore } = useFirebase();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const reviewRef = useMemoFirebase(() => firestore && doc(firestore, 'reviews', id), [firestore, id]);
  const { data: review, isLoading: reviewLoading } = useDoc<Review>(reviewRef);
  
  const authorRef = useMemoFirebase(() => firestore && review && doc(firestore, 'users', review.authorId), [firestore, review]);
  const { data: author, isLoading: authorLoading } = useDoc<UserProfile>(authorRef);
  
  const handleDeleteReview = async () => {
    if (!firestore || !review) return;
    const reviewRef = doc(firestore, 'reviews', review.id);
    try {
      await deleteDoc(reviewRef);
      toast({
        title: "Review Deleted",
        description: "Your review has been successfully deleted.",
      });
      router.push('/profile');
    } catch (error) {
      console.error("Error deleting review: ", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Failed to delete review. Please try again.",
      });
    }
  };

  if (reviewLoading || authorLoading) {
    return (
        <div className="container mx-auto max-w-5xl py-8 md:py-12">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Skeleton className="aspect-[3/4] rounded-lg w-full" />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-12 w-64" />
                    <Separator className="my-6" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!review) {
    notFound();
  }

  const categoryMap = {
    movie: 'Movie',
    book: 'Book',
    game: 'Game',
  };
  
  const formattedDate = review.createdAt?.toDate ? format(review.createdAt.toDate(), 'MMMM d, yyyy') : 'Recently';
  const isOwner = user && user.uid === review.authorId;

  return (
    <div className="container mx-auto max-w-5xl py-8 md:py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
             <Image
                src={review.imageUrl}
                alt={`Poster for ${review.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                data-ai-hint={review.imageHint}
                priority
            />
          </div>
        </div>
        <div className="md:col-span-2">
            <div className="flex items-start justify-between">
                <div>
                    <Badge variant={review.category === 'movie' ? 'default' : review.category === 'book' ? 'secondary' : 'outline'}>
                        {categoryMap[review.category]}
                    </Badge>
                    <h1 className="mt-2 text-3xl md:text-4xl font-bold font-headline">{review.title}</h1>
                    <div className="mt-4 flex items-center space-x-4">
                        <StarRating rating={review.rating} starClassName="h-6 w-6" />
                        <span className="text-xl font-bold">{review.rating.toFixed(1)}</span>
                    </div>
                </div>
                {isOwner && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/reviews/${review.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your review.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteReview}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>
            {author && (
                 <div className="mt-6 flex items-center space-x-3">
                    <Avatar>
                        <AvatarImage src={author.photoURL} alt={author.displayName} />
                        <AvatarFallback>{author.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{author.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                            Reviewed on {formattedDate}
                        </p>
                    </div>
                </div>
            )}
            <Separator className="my-6"/>
            <div className="prose prose-stone dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed">{review.content}</p>
            </div>
            <AiSummarizer reviewText={review.content} />
            <div className="mt-6 flex items-center space-x-4">
                <p className="text-sm text-muted-foreground">Was this review helpful?</p>
                <VoteButtons review={review} />
            </div>
        </div>
      </div>
      <Separator className="my-12" />
      <CommentSection reviewId={id} />
    </div>
  );
}
