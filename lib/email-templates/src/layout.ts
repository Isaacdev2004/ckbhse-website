import {
  DEFAULT_LAYOUT_LABELS,
  type BaseTemplateData,
  type EmailLayoutLabels,
  type RenderedEmail,
} from './types.js';

/** CKBHSE brand colours — deep navy foundation with electric cyan accents. */
export const BRAND = {
  navy: '#0f172a',
  cyan: '#06b6d4',
  cyanDark: '#0891b2',
  muted: '#64748b',
  background: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
} as const;

export interface LayoutOptions {
  readonly title: string;
  readonly preheader?: string;
  readonly bodyHtml: string;
  readonly cta?: { readonly label: string; readonly href: string };
  readonly labels?: Partial<EmailLayoutLabels>;
  readonly locale?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Branded HTML wrapper shared by all transactional templates.
 *
 * Accepts optional locale and label overrides so copy can be localised without
 * changing individual template renderers.
 */
export function wrapEmailLayout(options: LayoutOptions): string {
  const labels = { ...DEFAULT_LAYOUT_LABELS, ...options.labels };
  const preheader = options.preheader ?? options.title;
  const lang = options.locale ?? 'en-GB';

  const ctaBlock =
    options.cta === undefined
      ? ''
      : `<tr>
          <td style="padding:24px 0 8px;">
            <a href="${escapeHtml(options.cta.href)}"
               style="display:inline-block;background:${BRAND.cyan};color:${BRAND.white};text-decoration:none;font-weight:600;padding:12px 24px;border-radius:6px;">
              ${escapeHtml(options.cta.label)}
            </a>
          </td>
        </tr>`;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.background};font-family:'DM Sans',Arial,sans-serif;color:${BRAND.navy};">
  <span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.background};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND.navy};padding:20px 32px;">
              <span style="color:${BRAND.white};font-family:'Outfit',Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:0.02em;">CKBHSE</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-family:'Outfit',Arial,sans-serif;font-size:24px;line-height:1.3;color:${BRAND.navy};">${escapeHtml(options.title)}</h1>
              ${options.bodyHtml}
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:${BRAND.background};border-top:1px solid ${BRAND.border};">
              <p style="margin:0;font-size:12px;line-height:1.5;color:${BRAND.muted};">${escapeHtml(labels.footerNotice)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.navy};">${escapeHtml(text)}</p>`;
}

export function renderDetail(label: string, value: string): string {
  return `<p style="margin:0 0 8px;font-size:14px;line-height:1.5;color:${BRAND.navy};"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

export function templateLayoutOptions(
  data: BaseTemplateData,
  options: Omit<LayoutOptions, 'title' | 'locale'> & { readonly title?: string },
): Omit<LayoutOptions, 'title'> & { readonly title?: string } {
  return {
    ...options,
    ...(data.locale !== undefined ? { locale: data.locale } : {}),
  };
}

export function withLayout(
  subject: string,
  text: string,
  layoutOptions: Omit<LayoutOptions, 'title'> & { readonly title?: string },
): RenderedEmail {
  return {
    subject,
    text,
    html: wrapEmailLayout({
      title: layoutOptions.title ?? subject,
      ...layoutOptions,
    }),
  };
}
