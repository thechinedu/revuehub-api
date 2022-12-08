import { RepoFileContentsOptions } from '@/types';
import { request } from '@octokit/request';

export const getRepoFileContent = async ({
  token,
  owner,
  repo,
  file_sha,
}: RepoFileContentsOptions): Promise<string | null> => {
  try {
    const {
      data: { content },
    } = await request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
      headers: {
        authorization: `token ${token}`,
      },
      owner,
      repo,
      file_sha,
    });

    return content;
  } catch (err) {
    console.log(err); // TODO: Integrate with error monitoring service
    return null;
  }
};
