"use client";

import { createContext, useContext, ReactNode } from "react";
import { useLiveKit } from "@/hooks/useLiveKit";

interface LiveKitContextType {
  joinRoom: (roomId: string) => Promise<any>;
  createLocalTracks: (source?: "screen" | "camera" | "mic" | "webcam") => Promise<any[]>;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  disconnect: () => Promise<void>;
  cleanup: () => void;
  localStream: MediaStream | null;
  setLocalStream: (stream: MediaStream | null) => void;
  remoteStreams: any[];
  peers: any[];
  connected: boolean;
  currentRoomId: string | null;
  userId: string;
  displayName: string;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  // Compatibility with existing interface
  loadDevice: (rtpCapabilities: any) => Promise<any>;
  createSendTransport: () => Promise<any>;
  createRecvTransport: () => Promise<any>;
  produce: (stream: MediaStream, options?: any) => Promise<any[]>;
  consume: (producerId: string, rtpCapabilities: any, onStream?: any, initialMutedState?: boolean) => Promise<void>;
  setProducerMuted: (producerId: string, muted: boolean) => Promise<void>;
  device: any;
  socket: WebSocket | null;
}

const LiveKitContext = createContext<LiveKitContextType | undefined>(undefined);

export function LiveKitProvider({ children }: { children: ReactNode }) {
  const livekit = useLiveKit();

  return (
    <LiveKitContext.Provider value={livekit}>
      {children}
    </LiveKitContext.Provider>
  );
}

export function useLiveKitContext() {
  const context = useContext(LiveKitContext);
  if (context === undefined) {
    throw new Error("useLiveKitContext must be used within a LiveKitProvider");
  }
  return context;
}
