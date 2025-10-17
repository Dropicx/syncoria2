import { Hono } from 'hono';
import { generateLiveKitToken } from '@/lib/livekit';
import type { ReqVariables } from '@/index';
import { z } from 'zod';

const livekitRouter = new Hono<{ Variables: ReqVariables }>();

const tokenSchema = z.object({
  roomName: z.string().min(1),
});

livekitRouter.post('/token', async (c) => {
  const clerkUser = c.get('user');
  if (!clerkUser) {
    return c.json({ message: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const result = tokenSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({ message: 'Invalid request' }, 400);
  }

  const { roomName } = result.data;
  
  const token = generateLiveKitToken(
    roomName,
    clerkUser.id,
    `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
    {
      userId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      imageUrl: clerkUser.imageUrl
    }
  );

  return c.json({ 
    token, 
    url: env.LIVEKIT_URL || 'ws://localhost:7880' 
  });
});

export default livekitRouter;
