import { AccessToken } from 'livekit-server-sdk';
import { env } from '@/config/env';

export function generateLiveKitToken(
  roomName: string,
  participantIdentity: string,
  participantName: string,
  metadata?: Record<string, any>
) {
  const token = new AccessToken(
    env.LIVEKIT_API_KEY,
    env.LIVEKIT_API_SECRET,
    {
      identity: participantIdentity,
      name: participantName,
      metadata: JSON.stringify(metadata || {})
    }
  );

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true
  });

  return token.toJwt();
}
