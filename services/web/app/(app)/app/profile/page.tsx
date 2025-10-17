"use client";

import { useSession } from "@/hooks/useSession";
import { UserProfile } from "@call/ui/components/use-profile";

export default function ProfilePage() {
  const { session } = useSession();

  if (!session?.user) {
    return (
      <div className="px-10">
        <div className="mx-auto max-w-md py-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <p>Please sign in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10">
      <div className="mx-auto max-w-md py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-28 w-28">
            <UserProfile 
              name={session.user.fullName || session.user.firstName || "User"} 
              url={session.user.imageUrl} 
              className="h-full w-full" 
              size="lg" 
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">
              {session.user.fullName || session.user.firstName || "User"}
            </h1>
            <p className="text-muted-foreground">
              {session.user.primaryEmailAddress?.emailAddress || "No email"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
