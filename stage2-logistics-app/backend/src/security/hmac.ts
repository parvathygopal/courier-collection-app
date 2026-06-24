import crypto from "crypto";

export function signRawBody(
  rawBody: string,
  timestamp: string,
  secret: string,
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
}

export function verifySignature(params: {
  rawBody: string;
  timestamp: string;
  signature: string;
  secret: string;
  maxSkewMs?: number;
}) {
  const {
    rawBody,
    timestamp,
    signature,
    secret,
    maxSkewMs = 5 * 60 * 1000,
  } = params;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    return { ok: false as const, reason: "INVALID_TIMESTAMP" };
  }

  if (Math.abs(Date.now() - ts) > maxSkewMs) {
    return { ok: false as const, reason: "STALE_TIMESTAMP" };
  }

  const expected = signRawBody(rawBody, timestamp, secret);
  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return { ok: false as const, reason: "INVALID_SIGNATURE" };
  }

  const isValid = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  if (!isValid) {
    return { ok: false as const, reason: "INVALID_SIGNATURE" };
  }

  return { ok: true as const };
}
