import { useUser, useAuth } from "@clerk/nextjs";
// Using any for now since UserResource type is not easily accessible

export type Session = {
  user: any | null;
  isGuest: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
};

export function useSession() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { isLoaded: authLoaded } = useAuth();

  return {
    session: {
      user,
      isGuest: !user,
      isLoaded: isLoaded && authLoaded,
      isSignedIn,
    },
    isLoading: !isLoaded || !authLoaded,
    error: null,
  };
}
