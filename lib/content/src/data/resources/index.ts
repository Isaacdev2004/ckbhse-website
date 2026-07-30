import { articleResources } from './articles.js';
import {
  guideResources,
  templateResources,
  checklistResources,
} from './guides-templates.js';
import {
  webinarResources,
  newsResources,
  publicationResources,
} from './webinars-news-pubs.js';
import type { ResourcePageContent } from '../../schemas/resources.js';
import { buildResourcePath } from '../../schemas/resources.js';

export const resourcePageRegistry: ResourcePageContent[] = [
  ...articleResources,
  ...guideResources,
  ...templateResources,
  ...checklistResources,
  ...webinarResources,
  ...newsResources,
  ...publicationResources,
];

export const resourcePaths = resourcePageRegistry.map((page) => page.path);

export { buildResourcePath };
