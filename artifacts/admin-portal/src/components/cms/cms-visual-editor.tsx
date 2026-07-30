import { useEffect, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';

type HeroPayload = {
  badge?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
};

type StatItem = {
  icon?: string;
  value?: string;
  label?: string;
};

type SectionBlock = {
  title?: string;
  description?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readHero(payload: unknown): HeroPayload {
  if (!isRecord(payload) || !isRecord(payload.hero)) {
    return {};
  }
  const hero = payload.hero;
  return {
    badge: typeof hero.badge === 'string' ? hero.badge : '',
    title: typeof hero.title === 'string' ? hero.title : '',
    titleHighlight: typeof hero.titleHighlight === 'string' ? hero.titleHighlight : '',
    description: typeof hero.description === 'string' ? hero.description : '',
  };
}

function readStats(payload: unknown): StatItem[] {
  if (!isRecord(payload) || !Array.isArray(payload.stats)) {
    return [];
  }
  return payload.stats.map((item) => {
    if (!isRecord(item)) {
      return { icon: '', value: '', label: '' };
    }
    return {
      icon: typeof item.icon === 'string' ? item.icon : '',
      value: typeof item.value === 'string' ? item.value : '',
      label: typeof item.label === 'string' ? item.label : '',
    };
  });
}

function readSections(payload: unknown): SectionBlock[] {
  if (!isRecord(payload)) {
    return [];
  }
  if (Array.isArray(payload.sections)) {
    return payload.sections.map((item) => {
      if (!isRecord(item)) {
        return { title: '', description: '' };
      }
      return {
        title: typeof item.title === 'string' ? item.title : '',
        description: typeof item.description === 'string' ? item.description : '',
      };
    });
  }
  if (isRecord(payload.sections)) {
    return Object.entries(payload.sections).map(([key, item]) => {
      if (!isRecord(item)) {
        return { title: key, description: '' };
      }
      return {
        title: typeof item.title === 'string' ? item.title : key,
        description: typeof item.description === 'string' ? item.description : '',
      };
    });
  }
  return [];
}

function applyHero(payload: Record<string, unknown>, hero: HeroPayload) {
  return { ...payload, hero };
}

function applyStats(payload: Record<string, unknown>, stats: StatItem[]) {
  return { ...payload, stats };
}

function applySections(payload: Record<string, unknown>, sections: SectionBlock[]) {
  if (Array.isArray(payload.sections)) {
    return { ...payload, sections };
  }
  if (isRecord(payload.sections)) {
    const keys = Object.keys(payload.sections);
    const next: Record<string, SectionBlock> = {};
    keys.forEach((key, index) => {
      next[key] = sections[index] ?? { title: key, description: '' };
    });
    return { ...payload, sections: next };
  }
  return { ...payload, sections };
}

export function CmsVisualEditor({
  payload,
  contentType,
  disabled,
  onSave,
}: {
  payload: unknown;
  contentType: string;
  disabled?: boolean;
  onSave: (nextPayload: unknown, changeSummary: string) => Promise<void>;
}) {
  const basePayload = isRecord(payload) ? payload : {};
  const [hero, setHero] = useState<HeroPayload>(() => readHero(basePayload));
  const [stats, setStats] = useState<StatItem[]>(() => readStats(basePayload));
  const [sections, setSections] = useState<SectionBlock[]>(() => readSections(basePayload));
  const [rawJson, setRawJson] = useState(() => JSON.stringify(basePayload, null, 2));
  const [mode, setMode] = useState<'visual' | 'json'>('visual');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = isRecord(payload) ? payload : {};
    setHero(readHero(next));
    setStats(readStats(next));
    setSections(readSections(next));
    setRawJson(JSON.stringify(next, null, 2));
  }, [payload]);

  const supportsVisual =
    contentType === 'home' ||
    contentType === 'hub' ||
    contentType === 'corporate' ||
    contentType === 'contact' ||
    isRecord(basePayload.hero);

  async function handleSaveVisual() {
    setSaving(true);
    setError(null);
    try {
      let next = { ...basePayload };
      next = applyHero(next, hero);
      if (stats.length > 0) {
        next = applyStats(next, stats);
      }
      if (sections.length > 0) {
        next = applySections(next, sections);
      }
      await onSave(next, 'Updated via visual editor');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveJson() {
    setSaving(true);
    setError(null);
    try {
      const parsed = JSON.parse(rawJson) as unknown;
      await onSave(parsed, 'Updated via JSON editor');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Invalid JSON');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base">Content editor</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'visual' ? 'default' : 'outline'}
            disabled={!supportsVisual}
            onClick={() => setMode('visual')}
          >
            Visual
          </Button>
          <Button
            size="sm"
            variant={mode === 'json' ? 'default' : 'outline'}
            onClick={() => setMode('json')}
          >
            JSON
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            {error}
          </div>
        ) : null}

        {mode === 'visual' && supportsVisual ? (
          <>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Hero</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="hero-badge">Badge</Label>
                  <Input
                    id="hero-badge"
                    value={hero.badge ?? ''}
                    disabled={disabled}
                    onChange={(event) =>
                      setHero((current) => ({ ...current, badge: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hero-title">Title</Label>
                  <Input
                    id="hero-title"
                    value={hero.title ?? ''}
                    disabled={disabled}
                    onChange={(event) =>
                      setHero((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hero-highlight">Title highlight</Label>
                  <Input
                    id="hero-highlight"
                    value={hero.titleHighlight ?? ''}
                    disabled={disabled}
                    onChange={(event) =>
                      setHero((current) => ({
                        ...current,
                        titleHighlight: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="hero-description">Description</Label>
                <Textarea
                  id="hero-description"
                  rows={4}
                  value={hero.description ?? ''}
                  disabled={disabled}
                  onChange={(event) =>
                    setHero((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </div>
            </div>

            {stats.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Stats</h3>
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-3"
                  >
                    <Input
                      placeholder="Icon"
                      value={stat.icon ?? ''}
                      disabled={disabled}
                      onChange={(event) =>
                        setStats((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, icon: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder="Value"
                      value={stat.value ?? ''}
                      disabled={disabled}
                      onChange={(event) =>
                        setStats((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, value: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder="Label"
                      value={stat.label ?? ''}
                      disabled={disabled}
                      onChange={(event) =>
                        setStats((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, label: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {sections.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Sections</h3>
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded-md border border-border p-3"
                  >
                    <Input
                      placeholder="Section title"
                      value={section.title ?? ''}
                      disabled={disabled}
                      onChange={(event) =>
                        setSections((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Textarea
                      placeholder="Section description"
                      rows={3}
                      value={section.description ?? ''}
                      disabled={disabled}
                      onChange={(event) =>
                        setSections((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, description: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <Button disabled={disabled || saving} onClick={() => void handleSaveVisual()}>
              {saving ? 'Saving…' : 'Save draft'}
            </Button>
          </>
        ) : (
          <>
            <Textarea
              rows={18}
              className="font-mono text-xs"
              value={rawJson}
              disabled={disabled}
              onChange={(event) => setRawJson(event.target.value)}
            />
            <Button disabled={disabled || saving} onClick={() => void handleSaveJson()}>
              {saving ? 'Saving…' : 'Save draft'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
