import type { Review, UserProfile } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './ui/badge';
import StarRating from './star-rating';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

type ReviewCardProps = {
  review: Review;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  const { firestore } = useFirebase();
  
  const authorRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'users', review.authorId);
  }, [firestore, review.authorId]);
  
  const { data: author, isLoading: authorLoading } = useDoc<UserProfile>(authorRef);

  const categoryMap = {
    movie: 'Movie',
    book: 'Book',
    game: 'Game',
  };

  const formattedDate = review.createdAt?.toDate ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) : 'just now';

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/reviews/${review.id}`} className="block">
          <div className="aspect-[3/4] relative">
            <Image
              src={review.imageUrl}
              alt={`Poster for ${review.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={review.imageHint}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center justify-between mb-2">
            <Badge variant={review.category === 'movie' ? 'default' : review.category === 'book' ? 'secondary' : 'outline'}>
                {categoryMap[review.category]}
            </Badge>
            <StarRating rating={review.rating} />
        </div>
        <CardTitle className="text-lg leading-tight">
          <Link href={`/reviews/${review.id}`} className="hover:text-primary transition-colors">
            {review.title}
          </Link>
        </CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {authorLoading ? (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground w-full">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ) : author ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author.photoURL} alt={author.displayName} />
              <AvatarFallback>{author.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="truncate">{author.displayName}</span>
            <span>&middot;</span>
            <time dateTime={review.createdAt?.toDate ? review.createdAt.toDate().toISOString() : new Date().toISOString()}>
              {formattedDate}
            </time>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
}
