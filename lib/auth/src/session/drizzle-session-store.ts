import { createHash, randomBytes } from 'node:crypto';
import {
  asOrganizationId,
  asUserId,
} from '@workspace/domain/shared';
import { asSessionId } from '@workspace/platform/authorization';
import type { Database } from '@workspace/db';
import { sessions } from '@workspace/db/schema';
import { and, eq, gt, isNull, lt } from 'drizzle-orm';
import type {
  CreateSessionInput,
  RenewSessionInput,
  Session,
  SessionStatus,
} from '../session/session.interface.js';
import type { SessionStore } from '../session/session-store.interface.js';

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export const SESSION_ABSOLUTE_MS = 24 * 60 * 60 * 1000;
export const SESSION_REMEMBER_ABSOLUTE_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_IDLE_MS = 2 * 60 * 60 * 1000;
export const SESSION_REMEMBER_IDLE_MS = 7 * 24 * 60 * 60 * 1000;

function deriveStatus(
  row: typeof sessions.$inferSelect,
  now: Date,
): SessionStatus {
  if (row.revokedAt !== null) {
    return 'revoked';
  }
  if (row.expiresAt <= now || row.idleExpiresAt <= now) {
    return 'expired';
  }
  return 'active';
}

function mapRow(row: typeof sessions.$inferSelect, now: Date): Session {
  return {
    id: asSessionId(row.id),
    userId: asUserId(row.userId),
    organizationId: asOrganizationId(row.organizationId!),
    status: deriveStatus(row, now),
    expiresAt: row.expiresAt,
    idleExpiresAt: row.idleExpiresAt,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    deviceFingerprint: row.deviceFingerprint,
    rememberMe: row.rememberMe,
    createdAt: row.createdAt,
    lastActivityAt: row.lastActiveAt,
  };
}

export class DrizzleSessionStore implements SessionStore {
  constructor(
    private readonly db: Database,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async create(input: CreateSessionInput): Promise<Session> {
    const now = this.now();
    const rememberMe = input.rememberMe === true;
    const absoluteMs = rememberMe
      ? SESSION_REMEMBER_ABSOLUTE_MS
      : SESSION_ABSOLUTE_MS;
    const idleMs = rememberMe ? SESSION_REMEMBER_IDLE_MS : SESSION_IDLE_MS;
    const expiresAt = new Date(now.getTime() + absoluteMs);
    const idleExpiresAt = new Date(now.getTime() + idleMs);
    const token = generateSessionToken();

    const [row] = await this.db
      .insert(sessions)
      .values({
        userId: input.userId,
        organizationId: input.organizationId,
        tokenHash: hashSessionToken(token),
        deviceFingerprint: input.deviceFingerprint ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        expiresAt,
        idleExpiresAt,
        lastActiveAt: now,
        rememberMe,
      })
      .returning();

    if (row === undefined) {
      throw new Error('Failed to create session');
    }

    return mapRow(row, now);
  }

  async findById(id: ReturnType<typeof asSessionId>): Promise<Session | null> {
    const now = this.now();
    const [row] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .limit(1);

    return row === undefined ? null : mapRow(row, now);
  }

  async findActiveByUserId(
    userId: ReturnType<typeof asUserId>,
  ): Promise<readonly Session[]> {
    const now = this.now();
    const rows = await this.db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, now),
          gt(sessions.idleExpiresAt, now),
        ),
      );

    return rows.map((row) => mapRow(row, now));
  }

  async renew(
    id: ReturnType<typeof asSessionId>,
    input: RenewSessionInput,
  ): Promise<Session> {
    const now = this.now();
    const [row] = await this.db
      .update(sessions)
      .set({
        lastActiveAt: input.lastActivityAt,
        idleExpiresAt: input.idleExpiresAt,
        updatedAt: now,
      })
      .where(eq(sessions.id, id))
      .returning();

    if (row === undefined) {
      throw new Error('Session not found');
    }

    return mapRow(row, now);
  }

  async revoke(id: ReturnType<typeof asSessionId>): Promise<void> {
    const now = this.now();
    await this.db
      .update(sessions)
      .set({ revokedAt: now, updatedAt: now })
      .where(eq(sessions.id, id));
  }

  async revokeAllForUser(userId: ReturnType<typeof asUserId>): Promise<void> {
    const now = this.now();
    await this.db
      .update(sessions)
      .set({ revokedAt: now, updatedAt: now })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
  }

  async purgeExpired(before: Date): Promise<number> {
    const rows = await this.db
      .update(sessions)
      .set({ revokedAt: before })
      .where(and(lt(sessions.expiresAt, before), isNull(sessions.revokedAt)))
      .returning({ id: sessions.id });

    return rows.length;
  }
}
