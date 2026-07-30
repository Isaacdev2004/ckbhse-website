/* eslint-disable no-console -- build script progress output */
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { getPrerenderRoutes } from '@workspace/seo/routes';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

export interface PrerenderFullOptions {
  distDir: string;
  basePath?: string;
  port?: number;
}

/** Full-body prerender using Puppeteer — optional, enabled via PRERENDER_FULL=1. */
export async function prerenderFullPages(
  options: PrerenderFullOptions,
): Promise<void> {
  const puppeteer = await import('puppeteer').catch(() => null);
  if (!puppeteer) {
    console.warn(
      '[prerender-full] puppeteer not installed — skipping full render.',
    );
    return;
  }

  const port = options.port ?? 4173;
  const basePath = options.basePath ?? '/';
  const routes = getPrerenderRoutes();
  const server = createServer((req, res) =>
    serveSpa(req, res, options.distDir, basePath),
  );

  await new Promise<void>((resolve) =>
    server.listen(port, '127.0.0.1', resolve),
  );

  try {
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      for (const route of routes) {
        const url = `http://127.0.0.1:${port}${joinBase(basePath, route.path)}`;
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
        await page.waitForSelector('#main-content', { timeout: 15_000 });
        const html = await page.content();
        const outputPath =
          route.path === '/'
            ? join(options.distDir, 'index.html')
            : join(options.distDir, route.path.slice(1), 'index.html');
        mkdirSync(join(outputPath, '..'), { recursive: true });
        writeFileSync(outputPath, html, 'utf8');
        console.log(`[prerender-full] Rendered ${route.path}`);
      }
    } finally {
      await browser.close();
    }
  } finally {
    server.close();
  }
}

function joinBase(basePath: string, routePath: string): string {
  if (routePath === '/') {
    return basePath === '/' ? '/' : `${basePath}/`;
  }
  return basePath === '/'
    ? routePath
    : `${basePath.replace(/\/$/, '')}${routePath}`;
}

function serveSpa(
  req: IncomingMessage,
  res: ServerResponse,
  distDir: string,
  basePath: string,
): void {
  const url = req.url ?? '/';
  const pathOnly = url.split('?')[0]?.split('#')[0] ?? '/';
  const relative =
    basePath !== '/' && pathOnly.startsWith(basePath)
      ? pathOnly.slice(basePath.length) || '/'
      : pathOnly;

  const candidates = [
    join(distDir, relative === '/' ? 'index.html' : relative),
    join(distDir, relative.replace(/^\//, ''), 'index.html'),
    join(distDir, relative),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate) && !candidate.endsWith('/')) {
      const ext = extname(candidate);
      res.writeHead(200, {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
      });
      res.end(readFileSync(candidate));
      return;
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(readFileSync(join(distDir, 'index.html')));
}
