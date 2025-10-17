"use client";

import { SignIn } from "@clerk/nextjs";
import Logo from "@/components/shared/logo";

const Page = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm px-4">
        <Logo />
        <div className="w-full">
          <SignIn 
            routing="hash"
            redirectUrl="/app"
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                card: "shadow-lg",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
