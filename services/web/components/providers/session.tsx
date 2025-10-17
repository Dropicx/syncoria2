"use client";

import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useUser, useAuth } from "@clerk/nextjs";
// Using any for now since UserResource type is not easily accessible

type SessionContextType = {
  user: any | null | undefined;
  isGuest: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
};

export const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({
  children,
}: PropsWithChildren) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [session, setSession] = useState<SessionContextType | null>(null);

  useEffect(() => {
    setSession({
      user: clerkUser,
      isGuest: !clerkUser,
      isLoaded: isLoaded,
      isSignedIn: isSignedIn || false,
    });
  }, [clerkUser, isLoaded, isSignedIn]);

  if (!session) {
    return null;
  }

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
