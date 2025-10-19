'use client'

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@/lib/types";
import { useFirebase, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, runTransaction, arrayUnion, arrayRemove, increment } from "firebase/firestore";

type VoteButtonsProps = {
    review: Review;
};

export default function VoteButtons({ review }: VoteButtonsProps) {
    const { user } = useUser();
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const [currentUserVote, setCurrentUserVote] = useState<'up' | 'down' | null>(null);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        if (user) {
            if (review.upvotedBy?.includes(user.uid)) {
                setCurrentUserVote('up');
            } else if (review.downvotedBy?.includes(user.uid)) {
                setCurrentUserVote('down');
            } else {
                setCurrentUserVote(null);
            }
        } else {
            setCurrentUserVote(null);
        }
    }, [review.upvotedBy, review.downvotedBy, user]);

    const handleVote = async (voteType: 'up' | 'down') => {
        if (!user || !firestore) {
            toast({
                variant: "destructive",
                title: "Authentication required",
                description: "You must be logged in to vote.",
            });
            return;
        }

        if (isVoting) return;
        setIsVoting(true);

        const reviewRef = doc(firestore, 'reviews', review.id);

        try {
            await runTransaction(firestore, async (transaction) => {
                const reviewDoc = await transaction.get(reviewRef);
                if (!reviewDoc.exists()) {
                    throw "Document does not exist!";
                }

                const data = reviewDoc.data();
                const upvotedBy = data.upvotedBy || [];
                const downvotedBy = data.downvotedBy || [];

                const isCurrentlyUpvoted = upvotedBy.includes(user.uid);
                const isCurrentlyDownvoted = downvotedBy.includes(user.uid);
                
                if (voteType === 'up') {
                    if (isCurrentlyUpvoted) {
                        // User is removing their upvote
                        transaction.update(reviewRef, { 
                            upvotes: increment(-1),
                            upvotedBy: arrayRemove(user.uid)
                        });
                    } else {
                        // User is adding an upvote
                        const updates: any = { 
                            upvotes: increment(1),
                            upvotedBy: arrayUnion(user.uid)
                        };
                        // If user had previously downvoted, remove the downvote
                        if (isCurrentlyDownvoted) {
                            updates.downvotes = increment(-1);
                            updates.downvotedBy = arrayRemove(user.uid);
                        }
                        transaction.update(reviewRef, updates);
                    }
                } else { // voteType === 'down'
                    if (isCurrentlyDownvoted) {
                        // User is removing their downvote
                        transaction.update(reviewRef, { 
                            downvotes: increment(-1),
                            downvotedBy: arrayRemove(user.uid)
                        });
                    } else {
                        // User is adding a downvote
                        const updates: any = { 
                            downvotes: increment(1),
                            downvotedBy: arrayUnion(user.uid)
                        };
                        // If user had previously upvoted, remove the upvote
                        if (isCurrentlyUpvoted) {
                            updates.upvotes = increment(-1);
                            updates.upvotedBy = arrayRemove(user.uid);
                        }
                        transaction.update(reviewRef, updates);
                    }
                }
            });

        } catch (error) {
            console.error("Transaction failed: ", error);
            toast({
                variant: "destructive",
                title: "Vote failed",
                description: "Could not update your vote. Please try again.",
            });
        } finally {
            setIsVoting(false);
        }
    };


    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleVote('up')} className={cn("gap-2", currentUserVote === 'up' && 'bg-accent text-accent-foreground')} disabled={isVoting}>
                <ThumbsUp className="h-4 w-4" />
                <span>{review.upvotes ?? 0}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleVote('down')} className={cn("gap-2", currentUserVote === 'down' && 'bg-destructive/20 border-destructive text-destructive-foreground')} disabled={isVoting}>
                <ThumbsDown className="h-4 w-4" />
                 <span>{review.downvotes ?? 0}</span>
            </Button>
        </div>
    );
}
