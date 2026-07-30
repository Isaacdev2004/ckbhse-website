import type { EmailProvider } from '../../email/index.js';
import { EmailNotificationChannelProvider } from './email-channel-provider.js';
import { InAppNotificationChannelProvider } from './in-app-channel-provider.js';

export { EmailNotificationChannelProvider } from './email-channel-provider.js';
export {
  InAppNotificationChannelProvider,
  type InAppNotificationRecord,
} from './in-app-channel-provider.js';

export function createDefaultNotificationProviders(deps: {
  email: EmailProvider;
}) {
  return [
    new EmailNotificationChannelProvider(deps.email),
    new InAppNotificationChannelProvider(),
  ];
}
