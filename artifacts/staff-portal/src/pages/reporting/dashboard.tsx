import { useQueryClient } from '@tanstack/react-query';
import { ReportingLayout } from '@/components/reporting-layout';
import { DashboardWidget } from '@/components/reporting-widgets';
import { Button } from '@workspace/ui/components/button';
import {
  getReportingGetDashboardQueryKey,
  useReportingGetDashboard,
  useReportingSaveDashboardLayout,
  type ReportingDashboardLayoutItem,
} from '@workspace/api-client-react';
import { useAuth } from '@/providers/auth-provider';
import { PERMISSIONS } from '@workspace/platform/permissions';

export default function ReportingDashboardPage({
  dashboardKey,
}: {
  dashboardKey: string;
}) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useReportingGetDashboard(dashboardKey);
  const saveLayout = useReportingSaveDashboardLayout();

  const canPersonalize =
    session?.permissions.includes(PERMISSIONS.DASHBOARD_PERSONALIZE) === true;

  const moveWidget = (widgetKey: string, direction: -1 | 1) => {
    if (!data?.layout) return;
    const layout = [...data.layout].sort((a, b) => a.order - b.order);
    const index = layout.findIndex((item) => item.widgetKey === widgetKey);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= layout.length) return;

    const reordered = layout.map((item, idx) => {
      if (idx === index) return { ...layout[target]!, order: item.order };
      if (idx === target) return { ...layout[index]!, order: layout[target]!.order };
      return item;
    });

    const normalized = reordered
      .sort((a, b) => a.order - b.order)
      .map((item, order) => ({ ...item, order }));

    void saveLayout.mutateAsync(
      { dashboardKey, data: { layout: normalized } },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: getReportingGetDashboardQueryKey(dashboardKey),
          });
        },
      },
    );
  };

  return (
    <ReportingLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{data?.title ?? 'Dashboard'}</h2>
          {data?.description ? (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          ) : null}
          {data?.snapshotPeriod ? (
            <p className="text-xs text-muted-foreground">Period: {data.snapshotPeriod}</p>
          ) : null}
        </div>
        {canPersonalize && data?.layout?.length ? (
          <p className="text-xs text-muted-foreground">
            Use ↑ ↓ on widgets to personalize layout
          </p>
        ) : null}
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading dashboard…</p> : null}
      {isError ? (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data?.widgets ?? []).map((widget) => (
          <div key={widget.widgetKey} className="space-y-2">
            {canPersonalize ? (
              <div className="flex justify-end gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveWidget(widget.widgetKey, -1)}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveWidget(widget.widgetKey, 1)}
                >
                  ↓
                </Button>
              </div>
            ) : null}
            <DashboardWidget widget={widget} />
          </div>
        ))}
      </div>
    </ReportingLayout>
  );
}

export type { ReportingDashboardLayoutItem };
