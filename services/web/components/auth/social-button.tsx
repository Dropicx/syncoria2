"use client";

import { LoadingButton } from "@call/ui/components/loading-button";
import { Icons } from "@call/ui/components/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SocialButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      router.push("/login");
    } catch (error) {
      console.error("Failed to redirect to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoadingButton
      loading={isLoading}
      onClick={handleGoogleLogin}
      className="px-10"
      disabled={isLoading}
    >
      <Icons.google className="h-4 w-4" />
      Continue with Google
    </LoadingButton>
  );
};

export default SocialButton;
