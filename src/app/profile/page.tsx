'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, useAuth, useUserProfile } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Textarea } from '@/components/ui/textarea';
import { collection, deleteDoc, doc, query, setDoc, where } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import ReviewCard from '@/components/review-card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Camera, Trash2 } from 'lucide-react';
import type { Review, UserProfile } from '@/lib/types';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile<UserProfile>();

  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const userReviewsQuery = useMemoFirebase(
    () => user && firestore && query(collection(firestore, 'reviews'), where('authorId', '==', user.uid)),
    [user, firestore]
  );
  const { data: reviews, isLoading: reviewsLoading } = useCollection<Review>(userReviewsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
      setPhotoURL(userProfile.photoURL || '');
    } else if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [userProfile, user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !auth?.currentUser) return;
    setIsUpdating(true);

    const userRef = doc(firestore, 'users', user.uid);
    try {
      // Update Firestore document
      await setDoc(userRef, {
        displayName: displayName,
        bio: bio,
        photoURL: photoURL,
        email: user.email // Keep email in sync
      }, { merge: true });

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: photoURL
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!firestore) return;
    const reviewRef = doc(firestore, 'reviews', reviewId);
    try {
      await deleteDoc(reviewRef);
      toast({
        title: "Review Deleted",
        description: "Your review has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting review: ", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Failed to delete review. Please try again.",
      });
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !user) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <Skeleton className="h-6 w-40 mx-auto" />
                        <Skeleton className="h-5 w-full mx-auto" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className='md:col-span-2'>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-24 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    );
  }

  const userAvatar = placeholderImages.find(p => p.id === 'user-avatar-1');

  return (
    <div className="container mx-auto max-w-4xl py-12">
       <div className="grid md:grid-cols-3 gap-8 items-start">
         <div className="md:col-span-1 space-y-8">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="relative group">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={photoURL || userAvatar?.imageUrl} alt={displayName || 'User'} data-ai-hint="person face" />
                                        <AvatarFallback>{displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-8 w-8 text-white" />
                                    </div>
                                </button>
                            </DialogTrigger>
                             <DialogContent className="sm:max-w-[425px]">
                                <form onSubmit={handleProfileUpdate}>
                                    <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Make changes to your profile here. Click save when you're done.
                                    </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="displayName" className="text-right">Name</Label>
                                            <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="photoURL" className="text-right">Avatar URL</Label>
                                            <Input id="photoURL" value={photoURL} onChange={e => setPhotoURL(e.target.value)} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-start gap-4">
                                            <Label htmlFor="bio" className="text-right pt-2">Bio</Label>
                                            <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} className="col-span-3 min-h-[100px]" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="submit" disabled={isUpdating}>Save changes</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <div className="text-center">
                            <h2 className="text-2xl font-bold">{displayName}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                            {bio && <p className="mt-2 text-sm text-center text-muted-foreground italic">"{bio}"</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
         </div>

        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">My Reviews</CardTitle>
                    <CardDescription>All the reviews you've created.</CardDescription>
                </CardHeader>
                <CardContent>
                    {reviewsLoading ? (
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Skeleton className="h-96 w-full" />
                            <Skeleton className="h-96 w-full" />
                        </div>
                    ) : reviews && reviews.length > 0 ? (
                         <div className="grid sm:grid-cols-2 gap-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="relative">
                                    <ReviewCard review={review} />
                                    <div className="absolute top-2 right-2">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" className="h-8 w-8">
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
                                                    <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">You haven't written any reviews yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
