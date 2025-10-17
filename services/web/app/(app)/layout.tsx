import { Providers } from "@/components/providers";
import { ContactsProvider } from "@/components/providers/contacts";
import { SessionProvider } from "@/components/providers/session";
import { SocketProvider } from "@/components/providers/socket";
import { ThemeAndQueryProviders } from "@/components/providers/theme-and-query";
import SocketConnectionIndicator from "@/components/socket-connection-indicator";
import { CallProvider } from "@/contexts/call-context";
import { LiveKitProvider } from "@/contexts/livekit-context";
import React from "react";

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketProvider>
      <ThemeAndQueryProviders>
        <SessionProvider>
          <Providers>
            <LiveKitProvider>
              <CallProvider>
                <ContactsProvider>
                  {children}
                  <SocketConnectionIndicator />
                </ContactsProvider>
              </CallProvider>
            </LiveKitProvider>
          </Providers>
        </SessionProvider>
      </ThemeAndQueryProviders>
    </SocketProvider>
  );
};

export default AppLayout;
