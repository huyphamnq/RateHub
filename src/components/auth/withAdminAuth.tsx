'use client';

import { useUserProfile, useUser } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect, type ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

const withAdminAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const WithAdminAuthComponent = (props: P) => {
    const { user, isUserLoading } = useUser();
    const { data: userProfile, isLoading: isProfileLoading } = useUserProfile<UserProfile>();
    const router = useRouter();

    useEffect(() => {
      const isLoading = isUserLoading || isProfileLoading;
      if (!isLoading) {
        if (!user) {
          router.replace('/login');
        } else if (userProfile && userProfile.role !== 'admin') {
          router.replace('/');
        }
      }
    }, [user, userProfile, isUserLoading, isProfileLoading, router]);

    const isLoading = isUserLoading || isProfileLoading;
    if (isLoading || !userProfile || userProfile.role !== 'admin') {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithAdminAuthComponent.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAdminAuthComponent;
};

export default withAdminAuth;
