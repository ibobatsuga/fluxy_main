import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE, verifySession } from "../lib/session";

export type AuthedRequest = Request & {
  tenantId: string;
  userId: string;
};

/**
 * Reads the tenantId/userId that requireAuth attached to the request.
 * Only call this in handlers mounted behind requireAuth.
 */
export function getAuth(req: Request): AuthedRequest {
  return req as unknown as AuthedRequest;
}

/**
 * Verifies the session cookie and attaches tenantId/userId to the request.
 * tenantId here is the ONLY source of truth downstream code may use for
 * scoping queries — never trust a tenantId from the request body/params.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const payload = verifySession(token);
    (req as unknown as AuthedRequest).userId = payload.userId;
    (req as unknown as AuthedRequest).tenantId = payload.tenantId;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
