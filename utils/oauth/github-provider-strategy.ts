import { OAuthProviderStrategy } from '@/types';
import { OAuthApp } from '@octokit/oauth-app';

const OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;

const app = new OAuthApp({
  clientId: OAUTH_CLIENT_ID,
  clientSecret: OAUTH_CLIENT_SECRET,
});

export const githubProviderStrategy: OAuthProviderStrategy = {
  async getUserInfo(options) {
    try {
      const {
        authentication: { token, scopes },
      } = await app.createToken(options);

      console.log(token, scopes);

      return 'new oauth user';
    } catch (err) {
      console.log(err); // TODO: Integrate with error monitoring service
      return null;
    }
  },

  init() {
    // no_op
  },
};
