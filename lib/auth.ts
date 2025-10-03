'use server';

import 'server-only';
import { cookies } from 'next/headers';
import type { SessionPayload, User } from '@/lib/types';
import { USERS } from '@/lib/data/users';

// This would be in an environment variable in a real application
const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key-for-development-only-change-in-prod';
if (SECRET_KEY === 'your-secret-key-for-development-only-change-in-prod' && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: The session secret is not set. Please set SESSION_SECRET in your environment variables.');
}


// For simplicity in this scaffold, we're using a basic object.
// In a real app, you would use a library like `jose` for robust JWTs.
async function encrypt(payload: SessionPayload) {
  // This is a placeholder for actual encryption
  return JSON.stringify(payload);
}

async function decrypt(session: string): Promise<SessionPayload | null> {
  try {
    // This is a placeholder for actual decryption
    const payload = JSON.parse(session);
    // Very basic validation
    if (payload.userId && payload.expiresAt) {
      return {
        ...payload,
        expiresAt: new Date(payload.expiresAt),
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, expiresAt });

  cookies().set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;

  const session = await decrypt(sessionCookie);
  if (!session || new Date() > session.expiresAt) {
    return null;
  }

  return session;
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  const user = USERS.find((u) => u.id === session.userId);
  return user || null;
}

export async function deleteSession() {
  cookies().delete('session');
}
