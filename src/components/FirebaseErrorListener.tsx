'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, AppAuthError } from '@/firebase/errors';

type SupportedErrors = FirestorePermissionError | AppAuthError;

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 */
export function FirebaseErrorListener() {
  // Use a union type for the state to handle different error types.
  const [error, setError] = useState<SupportedErrors | null>(null);

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // For permission errors, we throw them to be caught by the Next.js error overlay,
      // which is useful for debugging security rules.
      setError(error);
    };

    // The auth error handler is a no-op here because auth errors are handled locally
    // in the components that trigger them (e.g., login/signup forms).
    // We subscribe to it to maintain a consistent pattern but don't need to throw globally.
    const handleAuthError = (error: AppAuthError) => {
        // This is handled locally by the login/signup form components
        // No global action needed here, but we keep the listener for pattern consistency
    };

    errorEmitter.on('permission-error', handlePermissionError);
    errorEmitter.on('auth-error', handleAuthError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
      errorEmitter.off('auth-error', handleAuthError);
    };
  }, []);

  // On re-render, if a permission error exists in state, throw it.
  if (error instanceof FirestorePermissionError) {
    throw error;
  }

  // This component renders nothing.
  return null;
}
