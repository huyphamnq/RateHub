'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { getSdks, setDocumentNonBlocking } from '.';
import { errorEmitter } from './error-emitter';
import { AppAuthError } from './errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, displayName: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
        // After user is created, update their profile
        const user = userCredential.user;
        updateProfile(user, { displayName: displayName });

        // Also create a document in the 'users' collection
        const { firestore } = getSdks(authInstance.app);
        const userDocRef = doc(firestore, 'users', user.uid);
        
        // Use non-blocking write to create user document
        setDocumentNonBlocking(userDocRef, {
            id: user.uid,
            displayName: displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: 'user', // Assign default role
            createdAt: serverTimestamp(),
        }, { merge: true });
    })
    .catch(error => {
        console.error("Error during sign up process:", error);
        errorEmitter.emit('auth-error', new AppAuthError(error.code, error.message));
    });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
        console.error("Error during sign in process:", error);
        // Emit a custom, serializable error object
        errorEmitter.emit('auth-error', new AppAuthError(error.code, error.message));
    });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
