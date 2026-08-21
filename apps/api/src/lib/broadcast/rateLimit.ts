// WAHA drives a real WhatsApp Web session — bulk sending is NOT an official, sanctioned use
// of the platform and carries real account-ban risk. These numbers are a deliberately
// conservative default, not a guarantee against bans; flagged clearly in the Fase 4 report.
export const WAHA_BROADCAST_MIN_DELAY_MS = 5000;
export const WAHA_BROADCAST_MAX_DELAY_MS = 10000;
export const WAHA_BROADCAST_DAILY_CAP = 100;

// Meta Cloud API has no per-message delay requirement — throughput is governed by the
// account's messaging tier (see Fase 4 report). A small delay avoids bursting past the
// standard ~80 messages/second throughput cap on a single connection.
export const META_BROADCAST_DELAY_MS = 250;

export function jitteredWahaDelayMs(): number {
  return WAHA_BROADCAST_MIN_DELAY_MS + Math.random() * (WAHA_BROADCAST_MAX_DELAY_MS - WAHA_BROADCAST_MIN_DELAY_MS);
}
