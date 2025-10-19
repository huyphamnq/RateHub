'use client';

import type { Comment as CommentType } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useState } from 'react';
import { useUser, useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type CommentSectionProps = {
  reviewId: string;
};

export default function CommentSection({ reviewId }: CommentSectionProps) {
  const { user } = useUser();
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const commentsQuery = useMemoFirebase(
    () =>
      firestore &&
      query(collection(firestore, 'reviews', reviewId, 'comments'), orderBy('createdAt', 'desc')),
    [firestore, reviewId]
  );
  const { data: comments, isLoading: commentsLoading } = useCollection<CommentType>(commentsQuery);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostComment = async () => {
    if (newComment.trim() && user && firestore) {
      setIsSubmitting(true);
      const commentsCollection = collection(firestore, 'reviews', reviewId, 'comments');
      const commentToAdd: Omit<CommentType, 'id'> = {
        authorId: user.uid,
        author: {
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
        },
        content: newComment,
        createdAt: serverTimestamp(),
      };
      
      try {
        await addDoc(commentsCollection, commentToAdd);
        setNewComment("");
      } catch (error) {
        console.error('Error posting comment:', error);
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: commentsCollection.path,
                operation: 'create',
                requestResourceData: commentToAdd,
            })
        );
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not post comment. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-headline mb-6">Comments ({comments?.length ?? 0})</h2>
      <div className="mb-8 flex gap-4">
        {user ? (
          <>
            <Avatar>
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                className="mb-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button onClick={handlePostComment} disabled={!newComment.trim() || isSubmitting}>
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center w-full p-4 border rounded-lg bg-muted">
            <p>You must be logged in to comment.</p>
          </div>
        )}
      </div>
      <div className="space-y-8">
        {commentsLoading && (
            [...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            ))
        )}
        {comments && comments.map((comment) => {
          if (!comment.author) return null;
          return (
            <div key={comment.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={comment.author.photoURL} alt={comment.author.displayName} />
                <AvatarFallback>{comment.author.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{comment.author.displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                  </span>
                </div>
                <p className="mt-1 text-foreground/90">{comment.content}</p>
              </div>
            </div>
          );
        })}
         {!commentsLoading && comments?.length === 0 && (
          <p className="text-muted-foreground text-center">Be the first to comment.</p>
        )}
      </div>
    </div>
  );
}
