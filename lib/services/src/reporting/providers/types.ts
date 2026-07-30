import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { KpiReading, ReportingDomain } from '@workspace/domain/reporting';

export interface KpiProvider {
  readonly domain: ReportingDomain;
  collect(context: AuthorizationContext): Promise<readonly KpiReading[]>;
}
