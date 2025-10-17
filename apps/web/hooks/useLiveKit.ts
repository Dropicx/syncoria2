"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { 
  Room, 
  RoomEvent, 
  Track, 
  LocalTrack, 
  RemoteTrack, 
  RemoteParticipant,
  LocalParticipant,
  TrackPublication,
  LocalTrackPublication,
  RemoteTrackPublication,
  createLocalVideoTrack,
  createLocalAudioTrack,
  LocalVideoTrack,
  LocalAudioTrack
} from "livekit-client";
import { useSession } from "@/components/providers/session";
import { toast } from "sonner";

interface RemoteStream {
  stream: MediaStream;
  producerId: string;
  peerId: string;
  userId: string;
  kind: "audio" | "video";
  source: "mic" | "webcam" | "screen";
  displayName: string;
  userImage?: string;
  muted: boolean;
}

interface Peer {
  id: string;
  displayName: string;
  connectionState: string;
  isCreator?: boolean;
}

export function useLiveKit() {
  const { user } = useSession();
  const roomRef = useRef<Room | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [userId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("user-id");
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("user-id", id);
      }
      return id;
    }
    return "";
  });

  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const isGuest = user?.id === "guest" || user?.name === "Guest";

    if (isGuest) {
      if (typeof window !== "undefined") {
        const storedName = localStorage.getItem("call_display_name");
        if (storedName && storedName.trim()) {
          setDisplayName(storedName.trim());
          return;
        }
      }

      if (typeof window !== "undefined") {
        let guestName = localStorage.getItem("display-name");
        if (!guestName) {
          guestName = `User-${Math.random().toString(36).slice(2, 8)}`;
          localStorage.setItem("display-name", guestName);
        }
        setDisplayName(guestName);
        return;
      }
    }

    if (user?.name) {
      setDisplayName(user?.fullName || user?.firstName || "User");
      return;
    }

    setDisplayName("Anonymous");
  }, [user]);

  const fetchToken = useCallback(async (roomName: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/livekit/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomName }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LiveKit token');
    }

    const data = await response.json();
    return data;
  }, []);

  const joinRoom = useCallback(async (roomId: string) => {
    try {
      // Clean up existing room
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }

      // Fetch token
      const { token, url } = await fetchToken(roomId);

      // Create room instance
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          videoSimulcastLayers: [
            { resolution: { width: 640, height: 360 }, encoding: { maxBitrate: 100_000 } },
            { resolution: { width: 1280, height: 720 }, encoding: { maxBitrate: 300_000 } },
            { resolution: { width: 1920, height: 1080 }, encoding: { maxBitrate: 900_000 } },
          ],
        },
      });

      roomRef.current = room;

      // Set up event listeners
      room.on(RoomEvent.Connected, () => {
        console.log("[LiveKit] Connected to room");
        setConnected(true);
        setCurrentRoomId(roomId);
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("[LiveKit] Disconnected from room");
        setConnected(false);
        setCurrentRoomId(null);
        setPeers([]);
        setRemoteStreams([]);
      });

      room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log("[LiveKit] Participant connected:", participant.identity);
        setPeers(prev => [...prev, {
          id: participant.identity,
          displayName: participant.name || participant.identity,
          connectionState: "connected"
        }]);
        toast.success(`${participant.name || participant.identity} joined the call`);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        console.log("[LiveKit] Participant disconnected:", participant.identity);
        setPeers(prev => prev.filter(p => p.id !== participant.identity));
        setRemoteStreams(prev => prev.filter(s => s.peerId !== participant.identity));
        toast.success(`${participant.name || participant.identity} left the call`);
      });

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        console.log("[LiveKit] Track subscribed:", track.kind, participant.identity);
        
        if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
          const stream = new MediaStream([track.mediaStreamTrack]);
          const source = publication.source === Track.Source.ScreenShare ? "screen" : 
                        publication.source === Track.Source.Camera ? "webcam" : "mic";
          
          setRemoteStreams(prev => {
            const existingIndex = prev.findIndex(s => s.peerId === participant.identity && s.kind === track.kind);
            const newStream = {
              stream,
              producerId: publication.trackSid,
              peerId: participant.identity,
              userId: participant.identity,
              kind: track.kind,
              source,
              displayName: participant.name || participant.identity,
              userImage: participant.metadata ? JSON.parse(participant.metadata).imageUrl : undefined,
              muted: publication.isMuted,
            };

            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = newStream;
              return updated;
            } else {
              return [...prev, newStream];
            }
          });
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        console.log("[LiveKit] Track unsubscribed:", track.kind, participant.identity);
        setRemoteStreams(prev => prev.filter(s => s.producerId !== publication.trackSid));
      });

      room.on(RoomEvent.TrackMuted, (publication: TrackPublication, participant: RemoteParticipant) => {
        console.log("[LiveKit] Track muted:", publication.kind, participant.identity);
        setRemoteStreams(prev => 
          prev.map(s => 
            s.peerId === participant.identity && s.kind === publication.kind
              ? { ...s, muted: true }
              : s
          )
        );
      });

      room.on(RoomEvent.TrackUnmuted, (publication: TrackPublication, participant: RemoteParticipant) => {
        console.log("[LiveKit] Track unmuted:", publication.kind, participant.identity);
        setRemoteStreams(prev => 
          prev.map(s => 
            s.peerId === participant.identity && s.kind === publication.kind
              ? { ...s, muted: false }
              : s
          )
        );
      });

      // Connect to room
      await room.connect(url, token);

      return {
        rtpCapabilities: null, // Not needed for LiveKit
        peers: Array.from(room.remoteParticipants.values()).map(p => ({
          id: p.identity,
          displayName: p.name || p.identity,
          connectionState: "connected"
        })),
        producers: [] // Not needed for LiveKit
      };

    } catch (error) {
      console.error("[LiveKit] Error joining room:", error);
      throw error;
    }
  }, [fetchToken, displayName, userId]);

  const createLocalTracks = useCallback(async (source?: "screen" | "camera" | "mic" | "webcam") => {
    if (!roomRef.current) return [];

    try {
      const tracks: LocalTrack[] = [];

      if (source === "screen") {
        // Screen sharing
        const screenTrack = await createLocalVideoTrack({
          source: Track.Source.ScreenShare,
          resolution: { width: 1920, height: 1080 }
        });
        tracks.push(screenTrack);
        setIsScreenSharing(true);
      } else {
        // Camera and microphone
        if (isCameraOn) {
          const videoTrack = await createLocalVideoTrack({
            source: Track.Source.Camera,
            resolution: { width: 1280, height: 720 }
          });
          tracks.push(videoTrack);
        }

        if (isMicOn) {
          const audioTrack = await createLocalAudioTrack();
          tracks.push(audioTrack);
        }
      }

      // Publish tracks
      for (const track of tracks) {
        await roomRef.current.localParticipant.publishTrack(track);
      }

      // Update local stream for preview
      if (source === "camera" || source === "webcam" || !source) {
        const videoTrack = tracks.find(t => t.kind === Track.Kind.Video) as LocalVideoTrack;
        if (videoTrack) {
          const stream = new MediaStream([videoTrack.mediaStreamTrack]);
          setLocalStream(stream);
        }
      }

      return tracks;
    } catch (error) {
      console.error("[LiveKit] Error creating local tracks:", error);
      return [];
    }
  }, [isCameraOn, isMicOn]);

  const toggleMic = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      const audioTrack = roomRef.current.localParticipant.audioTracks.values().next().value;
      if (audioTrack) {
        if (isMicOn) {
          await audioTrack.track?.mute();
        } else {
          await audioTrack.track?.unmute();
        }
        setIsMicOn(!isMicOn);
      }
    } catch (error) {
      console.error("[LiveKit] Error toggling mic:", error);
    }
  }, [isMicOn]);

  const toggleCamera = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      const videoTrack = roomRef.current.localParticipant.videoTracks.values().next().value;
      if (videoTrack) {
        if (isCameraOn) {
          await videoTrack.track?.mute();
        } else {
          await videoTrack.track?.unmute();
        }
        setIsCameraOn(!isCameraOn);
      }
    } catch (error) {
      console.error("[LiveKit] Error toggling camera:", error);
    }
  }, [isCameraOn]);

  const toggleScreenShare = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      if (isScreenSharing) {
        // Stop screen sharing
        const screenTrack = roomRef.current.localParticipant.videoTracks.values().next().value;
        if (screenTrack && screenTrack.source === Track.Source.ScreenShare) {
          await roomRef.current.localParticipant.unpublishTrack(screenTrack.track!);
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        await createLocalTracks("screen");
      }
    } catch (error) {
      console.error("[LiveKit] Error toggling screen share:", error);
    }
  }, [isScreenSharing, createLocalTracks]);

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setConnected(false);
    setCurrentRoomId(null);
    setPeers([]);
    setRemoteStreams([]);
    setLocalStream(null);
  }, []);

  const cleanup = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    joinRoom,
    createLocalTracks,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    disconnect,
    cleanup,
    localStream,
    setLocalStream,
    remoteStreams,
    peers,
    connected,
    currentRoomId,
    userId,
    displayName,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    // Compatibility with existing interface
    loadDevice: async () => null,
    createSendTransport: async () => null,
    createRecvTransport: async () => null,
    produce: createLocalTracks,
    consume: async () => {},
    setProducerMuted: async () => {},
    device: null,
    socket: null,
  };
}
