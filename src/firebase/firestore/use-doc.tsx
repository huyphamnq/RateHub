'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  DocumentSnapshot,
  FirestoreError,
  doc,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useUser } from '../auth/use-user';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/** Return type of the hook */
export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * Hook to fetch the current user's profile from /users/{uid}.
 * Automatically subscribes to real-time updates and handles auth & permission.
 */
export function useUserProfile<T = any>(): UseDocResult<T> {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
      () => user && firestore ? doc(firestore, 'users', user.uid) : null,
      [user, firestore]
  );

  return useDoc<T>(userDocRef);
}

/**
 * React hook to subscribe to a Firestore document in real-time.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedDocRef or BAD THINGS WILL HAPPEN.
 * Use useMemoFirebase to memoize it.
 *
 * @template T Type of the document data.
 * @param {DocumentReference<DocumentData> | null | undefined} memoizedDocRef - The Firestore DocumentReference. The hook will wait if the reference is null or undefined.
 * @returns {UseDocResult<T>} Object containing the document data, loading state, and error.
 */
export function useDoc<T = any>(
  memoizedDocRef: (DocumentReference<DocumentData> & { __memo?: boolean }) | null | undefined
): UseDocResult<T> {
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setIsLoading(false);
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })
        setError(contextualError);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  if(memoizedDocRef && !memoizedDocRef.__memo) {
    throw new Error(memoizedDocRef + ' was not properly memoized using useMemoFirebase');
  }

  return { data, isLoading, error };
}
