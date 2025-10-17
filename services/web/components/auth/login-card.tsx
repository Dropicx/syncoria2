"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@call/ui/components/card";
import { Button } from "@call/ui/components/button";
import { Icons } from "@call/ui/components/icons";
import { useRouter } from "next/navigation";

interface LoginCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoginCard = ({ 
  title = "Sign in to continue", 
  description = "Access your account to use all features",
  className = ""
}: LoginCardProps) => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleSignIn}
          className="w-full w-lg"
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
};
