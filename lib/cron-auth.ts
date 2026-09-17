import type { NextRequest } from "next/server";

/**
 * Vercel Cron automatikusan elküldi az `Authorization: Bearer <CRON_SECRET>`
 * fejlécet, ha a projektben be van állítva a CRON_SECRET környezeti
 * változó. Ez véd az illetéktelen (kívülről hívott) futtatás ellen.
 */
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // helyi fejlesztésben nincs beállítva
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
