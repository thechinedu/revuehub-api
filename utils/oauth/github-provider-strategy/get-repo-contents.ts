import { CreateRepositoryContentsDto } from '@/src/repositories/dto/create-repository-contents-dto';
import { RepoContentsOptions } from '@/types';
import { request } from '@octokit/request';

export const getRepoContents = async ({
  token,
  repo,
  owner,
  tree_sha,
  repository_id,
}: RepoContentsOptions) => {
  try {
    const {
      data: { tree },
    } = await request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
      headers: {
        authorization: `token ${token}`,
      },
      owner,
      repo,
      tree_sha,
      recursive: '1',
    });

    return tree.map(
      ({ path, type, sha }) =>
        ({
          repository_id,
          path,
          type,
          sha,
        } as CreateRepositoryContentsDto),
    );
  } catch (err) {
    console.log(err); // TODO: Integrate with error monitoring service
    return null;
  }
};
