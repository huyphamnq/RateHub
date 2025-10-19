'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from 'next/navigation';
import React, { useEffect } from "react";

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
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth, useUser } from "@/firebase";
import { initiateEmailSignUp } from "@/firebase/non-blocking-login";


const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export default function SignupPage() {
  const { toast } = useToast()
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    initiateEmailSignUp(auth, values.email, values.password, values.name);
  }
  
  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold font-headline">Create an account</h1>
        <p className="text-balance text-muted-foreground">
          Enter your information to create an account
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isLoading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="m@example.com" {...field} disabled={isLoading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} disabled={isLoading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </div>
    </>
  )
}
