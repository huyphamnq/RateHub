'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { User, LogOut, LayoutGrid, BarChart } from 'lucide-react';
import { useAuth, useUser, useUserProfile } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';

export default function UserNav() {
  const { user, isUserLoading } = useUser();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile<UserProfile>();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };
  
  if (isUserLoading || isProfileLoading) {
    return (
        <div className="flex items-center gap-2">
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    );
  }

  const isAdmin = userProfile?.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} data-ai-hint="person face" />
            <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin ? (
            <DropdownMenuItem asChild>
                <Link href="/admin">
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
                </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
                <Link href="/profile/stats">
                <BarChart className="mr-2 h-4 w-4" />
                <span>My Stats</span>
                </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
