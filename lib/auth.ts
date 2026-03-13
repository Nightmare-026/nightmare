import { headers } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-minimum-32-chars');

export async function verifyJWT() {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        avatarUrl: true, 
        isBanned: true 
      }
    });

    if (!user || user.isBanned) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('[verifyJWT] Token verification failed:', error instanceof Error ? error.message : error);
    return null;
  }
}
