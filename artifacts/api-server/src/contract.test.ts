import { describe, expect, it } from 'vitest';
import { ErrorResponseErrorCode } from '@workspace/api-zod';
import { statusForErrorCode, type ErrorCode } from '@workspace/platform/errors';

/**
 * Guards the coupling between the error taxonomy and the published contract.
 *
 * `ErrorCode` in `lib/platform` and the `ErrorResponse.error.code` enum in
 * `lib/api-spec/openapi.yaml` have to agree, or the server emits a code the
 * generated client cannot narrow on. Nothing enforces that at compile time
 * because one side is generated from YAML, so it is enforced here instead — this
 * is the test that fails when someone adds a code to one and forgets the other.
 */

// Listed explicitly rather than derived, so adding a code to the union is a
// deliberate two-line change with a visible diff on both sides.
const PLATFORM_ERROR_CODES: readonly ErrorCode[] = [
  'bad_request',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'payload_too_large',
  'unprocessable_entity',
  'rate_limited',
  'internal_error',
  'service_unavailable',
];

describe('error contract', () => {
  it('publishes exactly the codes the platform can produce', () => {
    expect(Object.values(ErrorResponseErrorCode).sort()).toEqual(
      [...PLATFORM_ERROR_CODES].sort(),
    );
  });

  it('maps every published code to its conventional status', () => {
    expect(
      Object.fromEntries(
        PLATFORM_ERROR_CODES.map((code) => [code, statusForErrorCode(code)]),
      ),
    ).toEqual({
      bad_request: 400,
      unauthorized: 401,
      forbidden: 403,
      not_found: 404,
      conflict: 409,
      payload_too_large: 413,
      unprocessable_entity: 422,
      rate_limited: 429,
      internal_error: 500,
      service_unavailable: 503,
    });
  });
});
