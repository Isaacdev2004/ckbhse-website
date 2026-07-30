import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@workspace/ui/components/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Progress } from '@workspace/ui/components/progress';
import type { ReportingDashboardWidget } from '@workspace/api-client-react';

type MetricData = {
  value: number | null;
  unit?: string;
  trendDirection?: 'up' | 'down' | 'stable';
  trendDelta?: number;
};

type BenchmarkData = MetricData & {
  target?: number;
  progress?: number;
};

type ChartData = {
  chartType?: string;
  points?: { label: string; value: number }[];
};

type TableData = {
  rows?: {
    key?: string;
    label: string;
    value: number;
    unit?: string;
    trendDirection?: string;
    trendDelta?: number;
  }[];
};

type TrendData = {
  kpiKey?: string;
  points?: { period: string; value: number | null }[];
};

type HeatmapData = {
  cells?: { likelihood: number; severity: number; count: number; rating: string }[];
};

function trendLabel(direction?: string, delta?: number) {
  const arrow =
    direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  return `${arrow} ${delta ?? 0}`;
}

function formatValue(value: number | null | undefined, unit?: string) {
  if (value === null || value === undefined) return '—';
  if (unit === 'percent') return `${value}%`;
  if (unit === 'hours') return `${value}h`;
  return String(value);
}

const chartConfig = {
  value: { label: 'Value', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

export function MetricWidget({
  title,
  data,
}: {
  title: string;
  data: MetricData | null | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(data?.value, data?.unit)}</div>
        <p className="text-xs text-muted-foreground">
          {trendLabel(data?.trendDirection, data?.trendDelta)}
        </p>
      </CardContent>
    </Card>
  );
}

export function BenchmarkWidget({
  title,
  data,
}: {
  title: string;
  data: BenchmarkData | null | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold">{formatValue(data?.value, data?.unit)}</div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Target {data?.target ?? '—'}{data?.unit === 'percent' ? '%' : ''}</span>
            <span>{data?.progress ?? 0}% of target</span>
          </div>
          <Progress value={Math.min(data?.progress ?? 0, 100)} />
        </div>
        <p className="text-xs text-muted-foreground">
          {trendLabel(data?.trendDirection, data?.trendDelta)}
        </p>
      </CardContent>
    </Card>
  );
}

export function ChartWidget({
  title,
  data,
}: {
  title: string;
  data: ChartData | null | undefined;
}) {
  const points = data?.points ?? [];

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart data={points}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function TrendWidget({
  title,
  data,
}: {
  title: string;
  data: TrendData | null | undefined;
}) {
  const points = (data?.points ?? []).map((point) => ({
    period: point.period,
    value: point.value ?? 0,
  }));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <LineChart data={points}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function TableWidget({
  title,
  data,
}: {
  title: string;
  data: TableData | null | undefined;
}) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {(data?.rows ?? []).map((row) => (
          <div
            key={row.key ?? row.label}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          >
            <span>{row.label}</span>
            <span className="font-medium">
              {formatValue(row.value, row.unit)}{' '}
              <span className="text-xs text-muted-foreground">
                {trendLabel(row.trendDirection, row.trendDelta)}
              </span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function HeatmapWidget({
  title,
  data,
}: {
  title: string;
  data: HeatmapData | null | undefined;
}) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(data?.cells ?? []).map((cell) => (
          <div
            key={`${cell.likelihood}-${cell.severity}`}
            className="rounded-md border p-3 text-sm"
          >
            L{cell.likelihood} × S{cell.severity} — {cell.count} item(s) — {cell.rating}
          </div>
        ))}
        {(data?.cells ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No risk data available.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function DashboardWidget({ widget }: { widget: ReportingDashboardWidget }) {
  const spanClass =
    widget.colSpan && widget.colSpan > 1 ? 'col-span-full lg:col-span-2' : '';

  const content = (() => {
    switch (widget.widgetType) {
      case 'metric':
        return <MetricWidget title={widget.title} data={widget.data as MetricData} />;
      case 'benchmark':
        return <BenchmarkWidget title={widget.title} data={widget.data as BenchmarkData} />;
      case 'chart':
        return <ChartWidget title={widget.title} data={widget.data as ChartData} />;
      case 'trend':
        return <TrendWidget title={widget.title} data={widget.data as TrendData} />;
      case 'table':
        return <TableWidget title={widget.title} data={widget.data as TableData} />;
      case 'heatmap':
        return <HeatmapWidget title={widget.title} data={widget.data as HeatmapData} />;
      default:
        return null;
    }
  })();

  return <div className={spanClass}>{content}</div>;
}
