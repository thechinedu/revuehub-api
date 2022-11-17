import { OAuthProviderStrategy } from '@/types';

import { getUserInfo } from './get-user-info';
import { getUserRepos } from './get-user-repos';
import { getRepoContents } from './get-repo-contents';

export const githubProviderStrategy: OAuthProviderStrategy = {
  getUserInfo,
  getUserRepos,
  getRepoContents,
};
