import { UserReposOptions } from '@/types';
import { request } from '@octokit/request';

export const getUserRepos = async ({ token, user_id }: UserReposOptions) => {
  try {
    const { data: repoList } = await request('GET /user/repos', {
      headers: {
        authorization: `token ${token}`,
      },
      type: 'owner',
      sort: 'updated',
      direction: 'desc',
    });

    return repoList.map(
      ({
        id,
        node_id,
        full_name,
        description,
        default_branch,
        updated_at,
      }) => ({
        snapshot_id: id,
        node_id,
        name: full_name,
        description,
        default_branch,
        last_updated: updated_at ? new Date(updated_at) : null,
        last_synced: new Date(Date.now()),
        user_id,
      }),
    );
  } catch (err) {
    console.log(err); // TODO: Integrate with error monitoring service
    return null;
  }
};
