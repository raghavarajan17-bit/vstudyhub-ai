import type { VercelRequest } from '@vercel/node';
import { adminAuth } from '../server-firebase-admin';

export const adminRequired = async (req: VercelRequest) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Firebase identity token required.');
  }

  const token = authorization.slice(7);

  const decodedToken = await adminAuth.verifyIdToken(token);


  if (decodedToken.email !== 'raghavarajan17@gmail.com') {
    throw new Error('Forbidden: Admin account required.');
  }

  return decodedToken;
};


