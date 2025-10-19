'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from 'next/navigation'
import { addDocumentNonBlocking, useFirebase, useUser } from "@/firebase"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"
import { collection, serverTimestamp } from "firebase/firestore"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  category: z.enum(['movie', 'book', 'game'], { required_error: "Please select a category." }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }),
  content: z.string().min(50, { message: "Review content must be at least 50 characters." }),
  rating: z.number().min(0.5).max(5),
  year: z.coerce.number().min(1800, {message: "Year must be after 1800"}).max(new Date().getFullYear() + 1, {message: "Year cannot be in the future."}),
  genre: z.string().min(2, {message: "Genre is required"}),
})

export default function NewReviewPage() {
  const { toast } = useToast()
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      content: "",
      rating: 2.5,
      year: new Date().getFullYear(),
      genre: ""
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;
    setIsLoading(true);

    const reviewData = {
      ...values,
      authorId: user.uid,
      createdAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      imageHint: `${values.category} ${values.genre}`, // Simple hint
    };

    const reviewsCollection = collection(firestore, 'reviews');
    // Non-blocking write and optimistic UI update
    addDocumentNonBlocking(reviewsCollection, reviewData);
    
    toast({
      title: "Review Submitted!",
      description: "Your review has been successfully submitted.",
    });
    router.push('/');
    // No need to setIsLoading(false) as we are navigating away
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create a New Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'An Absolute Masterpiece'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="movie">Movie</SelectItem>
                                <SelectItem value="book">Book</SelectItem>
                                <SelectItem value="game">Game</SelectItem>
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., 'Sci-Fi'" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Year Released</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 2023" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>


               <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image/Poster URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Review</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts in detail..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating: {field.value.toFixed(1)} / 5.0</FormLabel>
                    <FormControl>
                      <Slider
                        min={0.5}
                        max={5}
                        step={0.5}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
