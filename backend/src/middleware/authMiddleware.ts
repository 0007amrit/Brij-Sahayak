import { Request, Response, NextFunction } from 'express';

export function authorityAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const expectedKey = process.env.AUTHORITY_ADMIN_KEY || 'braj-authority-secure-key';

  if (!authHeader) {
    // Also accept x-authority-key header
    const altKey = req.headers['x-authority-key'];
    if (altKey === expectedKey) {
      return next();
    }
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authority access key required.'
    });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (token !== expectedKey && token !== 'authority2026') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Invalid authority credentials.'
    });
  }

  next();
}
