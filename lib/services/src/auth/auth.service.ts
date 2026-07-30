import { createHash, randomBytes } from 'node:crypto';
import {
  asOrganizationId,
  asUserId,
} from '@workspace/domain/shared';
import type { Database } from '@workspace/db';
import {
  passwordHistory,
  passwordResetTokens,
  users,
} from '@workspace/db/schema';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import type {
  PasswordHasher,
  PasswordPolicyEvaluator,
  PermissionResolver,
  RoleResolver,
  SessionCookieManager,
  SessionStore,
} from '@workspace/auth';
import {
  isPasswordPolicyValid,
  SESSION_IDLE_MS,
  SESSION_REMEMBER_IDLE_MS,
} from '@workspace/auth';
import { AppError } from '@workspace/platform/errors';
import {
  asSessionId,
  createUserContext,
  type AuthorizationContext,
  type RequestMetadata,
} from '@workspace/platform/authorization';

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

export interface LoginInput {
  readonly email: string;
  readonly password: string;
  readonly organizationId?: string;
  readonly rememberMe?: boolean;
  readonly metadata: RequestMetadata;
}

export interface LoginResult {
  readonly sessionId: ReturnType<typeof asSessionId>;
  readonly context: AuthorizationContext;
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
  };
}

export interface AuthServiceDeps {
  readonly db: Database;
  readonly sessionStore: SessionStore;
  readonly sessionCookies: SessionCookieManager;
  readonly passwordHasher: PasswordHasher;
  readonly passwordPolicy: PasswordPolicyEvaluator;
  readonly permissionResolver: PermissionResolver;
  readonly roleResolver: RoleResolver;
  readonly defaultOrganizationId: string;
  readonly now?: () => Date;
}

export interface CurrentUserResult {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
  };
  readonly organizationId: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

export class AuthService {
  private readonly now: () => Date;

  constructor(private readonly deps: AuthServiceDeps) {
    this.now = deps.now ?? (() => new Date());
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const email = input.email.trim().toLowerCase();
    const [user] = await this.deps.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (
      user === undefined ||
      user.passwordHash === null ||
      user.status !== 'active'
    ) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const valid = await this.deps.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );
    if (!valid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const organizationId = asOrganizationId(
      input.organizationId ?? this.deps.defaultOrganizationId,
    );

    const session = await this.deps.sessionStore.create({
      userId: asUserId(user.id),
      organizationId,
      rememberMe: input.rememberMe === true,
      ipAddress: input.metadata.ipAddress ?? null,
      userAgent: input.metadata.userAgent ?? null,
    });

    const context = await this.buildContext(session.id, input.metadata);
    if (context === null) {
      throw AppError.internal('Failed to establish session context');
    }

    return {
      sessionId: session.id,
      context,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async logout(sessionId: ReturnType<typeof asSessionId>): Promise<void> {
    await this.deps.sessionStore.revoke(sessionId);
  }

  async getSession(
    sessionId: ReturnType<typeof asSessionId>,
    metadata: RequestMetadata,
  ): Promise<AuthorizationContext | null> {
    return this.buildContext(sessionId, metadata);
  }

  async refreshSession(
    sessionId: ReturnType<typeof asSessionId>,
    metadata: RequestMetadata,
  ): Promise<AuthorizationContext | null> {
    return this.buildContext(sessionId, metadata, { renew: true });
  }

  async getCurrentUser(
    context: AuthorizationContext,
  ): Promise<CurrentUserResult> {
    if (context.userId === undefined || context.organizationId === undefined) {
      throw AppError.unauthorized();
    }

    const [user] = await this.deps.db
      .select()
      .from(users)
      .where(eq(users.id, context.userId))
      .limit(1);

    if (user === undefined || user.status !== 'active') {
      throw AppError.unauthorized();
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      organizationId: context.organizationId,
      roles: [...context.roles],
      permissions: [...context.permissions],
    };
  }

  async changePassword(
    context: AuthorizationContext,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (context.userId === undefined) {
      throw AppError.unauthorized();
    }

    const [user] = await this.deps.db
      .select()
      .from(users)
      .where(eq(users.id, context.userId))
      .limit(1);

    if (user === undefined || user.passwordHash === null) {
      throw AppError.unauthorized();
    }

    const valid = await this.deps.passwordHasher.verify(
      currentPassword,
      user.passwordHash,
    );
    if (!valid) {
      throw AppError.unauthorized('Current password is incorrect');
    }

    const historyRows = await this.deps.db
      .select({ passwordHash: passwordHistory.passwordHash })
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, user.id))
      .orderBy(desc(passwordHistory.createdAt))
      .limit(this.deps.passwordPolicy.policy.historyCount);

    const policyResult = this.deps.passwordPolicy.evaluate(newPassword, {
      email: user.email,
      previousHashes: historyRows.map((row) => row.passwordHash),
    });
    if (!isPasswordPolicyValid(policyResult)) {
      throw AppError.unprocessable(
        policyResult.violations.map((v) => v.message).join('; '),
      );
    }

    for (const previousHash of historyRows) {
      if (await this.deps.passwordHasher.verify(newPassword, previousHash.passwordHash)) {
        throw AppError.unprocessable(
          'Password was used recently and cannot be reused',
        );
      }
    }

    const passwordHash = await this.deps.passwordHasher.hash(newPassword);
    const now = this.now();

    await this.deps.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash, updatedAt: now })
        .where(eq(users.id, user.id));
      await tx.insert(passwordHistory).values({
        userId: user.id,
        passwordHash: user.passwordHash!,
      });
    });

    await this.deps.sessionStore.revokeAllForUser(asUserId(user.id));
  }

  async requestPasswordReset(email: string, requestedIp?: string): Promise<string | null> {
    const normalized = email.trim().toLowerCase();
    const [user] = await this.deps.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalized))
      .limit(1);

    if (user === undefined) {
      return null;
    }

    const token = generateOpaqueToken();
    const expiresAt = new Date(this.now().getTime() + 60 * 60 * 1000);

    await this.deps.db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashOpaqueToken(token),
      expiresAt,
      requestedIp: requestedIp ?? null,
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashOpaqueToken(token);
    const now = this.now();

    const [resetRow] = await this.deps.db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ),
      )
      .limit(1);

    if (resetRow === undefined) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    const [user] = await this.deps.db
      .select()
      .from(users)
      .where(eq(users.id, resetRow.userId))
      .limit(1);

    if (user === undefined) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    const policyResult = this.deps.passwordPolicy.evaluate(newPassword, {
      email: user.email,
    });
    if (!isPasswordPolicyValid(policyResult)) {
      throw AppError.unprocessable(
        policyResult.violations.map((v) => v.message).join('; '),
      );
    }

    const passwordHash = await this.deps.passwordHasher.hash(newPassword);

    await this.deps.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash, updatedAt: now })
        .where(eq(users.id, user.id));
      await tx
        .update(passwordResetTokens)
        .set({ usedAt: now, updatedAt: now })
        .where(eq(passwordResetTokens.id, resetRow.id));
      if (user.passwordHash !== null) {
        await tx.insert(passwordHistory).values({
          userId: user.id,
          passwordHash: user.passwordHash,
        });
      }
    });

    await this.deps.sessionStore.revokeAllForUser(asUserId(user.id));
  }

  private async buildContext(
    sessionId: ReturnType<typeof asSessionId>,
    metadata: RequestMetadata,
    options: { renew?: boolean } = {},
  ): Promise<AuthorizationContext | null> {
    const session = await this.deps.sessionStore.findById(sessionId);
    if (session === null || session.status !== 'active') {
      return null;
    }

    const now = this.now();
    const idleMs = session.rememberMe
      ? SESSION_REMEMBER_IDLE_MS
      : SESSION_IDLE_MS;

    if (options.renew === true) {
      await this.deps.sessionStore.renew(sessionId, {
        lastActivityAt: now,
        idleExpiresAt: new Date(now.getTime() + idleMs),
      });
    }

    const [resolvedPermissions, resolvedRoles] = await Promise.all([
      this.deps.permissionResolver.resolveForUser(
        session.userId,
        session.organizationId,
      ),
      this.deps.roleResolver.resolveForUser(
        session.userId,
        session.organizationId,
      ),
    ]);

    return createUserContext({
      userId: session.userId,
      organizationId: session.organizationId,
      sessionId: session.id,
      roles: resolvedRoles.map((role) => role.roleKey),
      permissions: [...resolvedPermissions.permissions],
      metadata,
    });
  }
}
