import { Request, Response, NextFunction } from 'express';
import { adminAuth, db } from '../firebase-admin';

// Extend Express Request to include admin user info
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        uid: string;
        email: string;
        name?: string;
        picture?: string;
      };
    }
  }
}

/**
 * Express middleware that verifies Firebase ID tokens and checks the
 * Firestore `velorastoreadmins` collection for admin email whitelist.
 *
 * Usage: router.get('/admin/stats', requireAdmin, handler);
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected: Bearer <idToken>',
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Firebase token does not contain an email address.',
      });
    }

    // Check if email exists in the Firestore admin whitelist
    const adminDoc = await db.collection('velorastoreadmins').doc(email).get();

    if (!adminDoc.exists) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'Your Google account is not authorized to access the admin dashboard.',
      });
    }

    // Attach admin user info to the request
    req.adminUser = {
      uid: decodedToken.uid,
      email: email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };

    next();
  } catch (error: any) {
    console.error('Admin auth error:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Your session has expired. Please sign in again.',
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token.',
    });
  }
}
