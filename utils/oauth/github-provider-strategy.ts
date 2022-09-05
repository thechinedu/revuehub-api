import { CreateOauthUserDto } from '@/src/users/dto/create-oauth-user-dto';
import { OAuthProviderStrategy } from '@/types';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { request } from '@octokit/request';
import { randomBytes } from 'crypto';

const OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID as string;
const OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET as string;

const auth = createOAuthAppAuth({
  clientId: OAUTH_CLIENT_ID,
  clientSecret: OAUTH_CLIENT_SECRET,
});

const getUserInfo = async (options: CreateOauthUserDto) => {
  try {
    const { token } = await auth({ type: 'oauth-user', ...options });
    // TODO: Email can be null. Handle case for when email is null
    const {
      data: {
        email,
        login: username,
        avatar_url: profile_image_url,
        name: full_name,
      },
    } = await request('GET /user', {
      headers: {
        authorization: `token ${token}`,
      },
    });

    return {
      email: email || '',
      email_verified: Boolean(email),
      username,
      profile_image_url,
      full_name: full_name || '',
      // Generate random password for oauth user
      // OAuth users don't need a password but the db schema expects a password digest
      // to be set for every user
      password: randomBytes(16).toString('hex'),
    };
  } catch (err) {
    console.log(err); // TODO: Integrate with error monitoring service
    return null;
  }
};

export const githubProviderStrategy: OAuthProviderStrategy = {
  getUserInfo,
};
