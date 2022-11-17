import { RepoContentsOptions } from '@/types';
import { request } from '@octokit/request';

export const getRepoContents = async ({
  token,
  repo,
  owner,
  tree_sha,
}: RepoContentsOptions) => {
  try {
    console.log('Getting repo contents');
    const {
      data: { tree, truncated },
    } = await request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
      headers: {
        authorization: `token ${token}`,
      },
      owner,
      repo,
      tree_sha,
      recursive: '1',
    });

    console.log({ truncated, tree });

    return [];
  } catch (err) {
    console.log(err); // TODO: Integrate with error monitoring service
    return null;
  }
};
