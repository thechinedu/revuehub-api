import { OAuthProviderStrategy } from '@/types';

import { getUserInfo } from './get-user-info';
import { getUserRepos } from './get-user-repos';
import { getRepoContents } from './get-repo-contents';
import { getRepoFileContent } from './get-repo-file-content';

export const githubProviderStrategy: OAuthProviderStrategy = {
  getUserInfo,
  getUserRepos,
  getRepoContents,
  getRepoFileContent,
};
