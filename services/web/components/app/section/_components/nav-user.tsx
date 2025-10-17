// This file defines the user section in the sidebar, showing user info and a dropdown menu for user actions.
"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@call/ui/components/sidebar";
import { UserButton } from "@clerk/nextjs";
import { useSession } from "@/hooks/useSession";

export function NavUser() {
  const { session } = useSession();
  const { state } = useSidebar();

  if (!session?.user) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center justify-center p-2">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "shadow-lg",
              }
            }}
            afterSignOutUrl="/login"
          />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
