import { OAuthProviderStrategy, OAuthProviders } from '@/types';

import { githubProviderStrategy } from './github-provider-strategy';

type GetOAuthProviderFn = (provider: OAuthProviders) => OAuthProviderStrategy;

const oauthProviderStrategies = {
  [OAuthProviders.GITHUB]: githubProviderStrategy,
};

export const getOAuthProvider: GetOAuthProviderFn = (provider) =>
  oauthProviderStrategies[provider];
