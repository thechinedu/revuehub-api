enum OAuthProviders {
  GITHUB = 'github',
}

type OAuthProviderStrategy = {
  getUserInfo: (code: string) => any; // TODO: Add proper type annotation for this return type
};

type GetOAuthProviderFn = (provider: OAuthProviders) => OAuthProviderStrategy;

export const generateOauthState = () => {
  // noop
};

const githubProviderStrategy: OAuthProviderStrategy = {
  getUserInfo: (code) => {
    return 'new oauth user';
  },
};

const oauthProviderStrategies = {
  [OAuthProviders.GITHUB]: githubProviderStrategy,
};

export const getOauthProvider: GetOAuthProviderFn = (provider) =>
  oauthProviderStrategies[provider];
