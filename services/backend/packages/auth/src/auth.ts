import { createClerkClient } from "@clerk/backend";

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error(
    "Missing CLERK_SECRET_KEY in environment variables. Please set it in your .env file."
  );
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Export types for compatibility
export type Session = {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddresses: Array<{
      emailAddress: string;
      id: string;
    }>;
    imageUrl: string;
    createdAt: number;
    updatedAt: number;
  };
  session: {
    id: string;
    userId: string;
    status: string;
    expireAt: number;
    createdAt: number;
    updatedAt: number;
  };
};
