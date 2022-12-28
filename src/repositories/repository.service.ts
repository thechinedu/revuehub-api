import { UserAuthTokenService } from '@/src/user-auth-tokens/user-auth-token.service';
import { OAuthProviders } from '@/types';
import { getOAuthProvider } from '@/utils';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { RepositoryModel } from './repository.model';
import { RepositoryBlobModel } from './repository-blob.model';
import {
  RepositoryContentEntity,
  RepositoryContentModel,
} from './repository-content.model';

type RepositoryContentBlob = Pick<
  RepositoryContentEntity,
  'id' | 'path' | 'type'
>;

type RepositoryContentTree = RepositoryContentBlob & {
  contents: (RepositoryContentBlob | RepositoryContentTree)[];
};

type RepositoryContentRes = {
  [key: string]: RepositoryContentBlob | RepositoryContentTree;
};

const OAuthAccessTokenRevokedException = new HttpException(
  { status: 'fail', message: 'OAuth access token is no longer valid' },
  HttpStatus.UNPROCESSABLE_ENTITY,
);

@Injectable()
export class RepositoryService {
  constructor(
    private repositoryModel: RepositoryModel,
    private repositoryBlobModel: RepositoryBlobModel,
    private repositoryContentModel: RepositoryContentModel,
    private userAuthTokenService: UserAuthTokenService,
  ) {}

  async fetchActiveRepos(user_id: number) {
    return this.repositoryModel.findAll({
      where: {
        has_pulled_content: true,
        user_id,
      },
      select: ['id', 'name', 'description', 'last_updated'],
    });
  }

  async fetchInactiveRepos(user_id: number) {
    return this.repositoryModel.findAll({
      where: {
        has_pulled_content: false,
        user_id,
      },
      select: ['id', 'name', 'description', 'last_updated'],
    });
  }

  async fetchAllRepos(user_id: number) {
    const repos = await this.repositoryModel.findAll({
      where: {
        user_id,
      },
      select: [
        'id',
        'name',
        'description',
        'last_updated',
        'has_pulled_content',
      ],
    });

    if (repos.length) {
      // TODO: schedule repository updates to happen in the background
      return repos;
    }

    const token = await this.getOAuthAccessToken(user_id);

    // TODO: get the provider from request
    // Only Github is supported for now so this is fine. If support is added for
    // other git providers in the future, this will need to change
    const oauthProviderStrategy = getOAuthProvider(OAuthProviders.GITHUB);
    const providerRepoList = await oauthProviderStrategy.getUserRepos({
      token,
      user_id,
    });

    if (providerRepoList?.length) {
      return this.repositoryModel.bulkCreate(providerRepoList);
    }

    // TODO: if it gets here, the oauth token has been revoked. Throw an error instead.
    // client should redirect to oauth provider auth page
    return [];
  }

  async addRepoContents(user_id: number, repository_id: number) {
    const repository = await this.repositoryModel.find({
      where: { id: repository_id, user_id },
      select: ['name', 'default_branch'],
    });

    if (!repository) {
      throw new HttpException(
        { status: 'fail', message: 'Bad request' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = await this.getOAuthAccessToken(user_id);

    const [owner, repo] = repository.name.split('/');

    // TODO: get the provider from request
    // Only Github is supported for now so this is fine. If support is added for
    // other git providers in the future, this will need to change
    const oauthProviderStrategy = getOAuthProvider(OAuthProviders.GITHUB);

    const repoContents = await oauthProviderStrategy.getRepoContents({
      token,
      owner,
      repo,
      tree_sha: repository.default_branch, // TODO: get branch name from request object
      repository_id,
    });

    if (repoContents?.length) {
      return this.repositoryContentModel.bulkCreate(repoContents);
    }

    // TODO: if it gets here, the oauth token has been revoked. Throw an error instead.
    // client should redirect to oauth provider auth page
    return [];
  }

  async fetchRepoContents(repository_id: number) {
    const repositoryContents = await this.repositoryContentModel.findAll({
      where: {
        repository_id,
      },
      select: ['id', 'path', 'type'],
    });

    if (!repositoryContents.length) {
      throw new HttpException(
        {
          status: 'fail',
          message: 'No content found for the given repository',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return Object.values(this.transformRepositoryContents(repositoryContents));
  }

  async fetchRepoByName(name: string) {
    const repository = await this.repositoryModel.find({
      where: {
        name,
      },
      select: ['id', 'name', 'description', 'default_branch'],
    });

    if (!repository) {
      throw new HttpException(
        {
          status: 'fail',
          message: 'No repository with the given name was found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return repository;
  }

  async fetchRepoBlobFileContents(
    user_id: number,
    repository_content_id: number,
  ) {
    const repoContent = await this.repositoryContentModel.find({
      where: { id: repository_content_id },
      select: ['repository_id', 'sha', 'type'],
    });

    if (!repoContent || repoContent.type !== 'blob') {
      throw new HttpException(
        {
          status: 'fail',
          message: "File doesn't exist or file is not a blob type",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const repoFile = await this.repositoryBlobModel.find({
      where: { repository_content_id },
      select: ['content'],
    });

    if (repoFile) return repoFile;

    const repository = await this.repositoryModel.find({
      where: { id: repoContent.repository_id, user_id },
      select: ['name'],
    });

    if (!repository) {
      throw new HttpException(
        { status: 'fail', message: 'Bad request' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const [owner, repo] = repository.name.split('/');

    const token = await this.getOAuthAccessToken(user_id);

    // TODO: get the provider from request
    // Only Github is supported for now so this is fine. If support is added for
    // other git providers in the future, this will need to change
    const oauthProviderStrategy = getOAuthProvider(OAuthProviders.GITHUB);

    const content = await oauthProviderStrategy.getRepoFileContent({
      token,
      owner,
      repo,
      file_sha: repoContent.sha,
    });

    if (!content) throw OAuthAccessTokenRevokedException;

    return this.repositoryBlobModel.create({
      repository_content_id,
      content,
    });
  }

  private async getOAuthAccessToken(user_id: number) {
    try {
      const {
        token,
        expires_at: expiresAt,
        is_valid: isValid,
      } = await this.userAuthTokenService.findOAuthTokenForUser(user_id);

      if (!token || !isValid || Date.now() > +expiresAt) {
        throw OAuthAccessTokenRevokedException;
      }

      return token;
    } catch {
      throw OAuthAccessTokenRevokedException;
    }
  }

  private transformRepositoryContents(
    repositoryContents: RepositoryContentEntity[],
  ) {
    const res: RepositoryContentRes = {};

    repositoryContents.forEach(({ id, path, type }) => {
      const segments = path.split('/');
      const isRootLevelContent = segments.length === 1;

      if (isRootLevelContent) {
        res[path] = {
          id,
          path,
          type,
          contents: [],
        };

        return;
      }

      const rootLevelContent = res[segments[0]];

      this.addNestedContent({
        id,
        path,
        type,
        contents: (rootLevelContent as RepositoryContentTree).contents,
        segments,
      });
    });

    return res;
  }

  private getDir(
    contents: RepositoryContentTree['contents'],
    segments: string[],
    endSegment = 2,
  ): RepositoryContentTree['contents'] | undefined {
    const path = segments.slice(0, endSegment).join('/');
    const content = contents.find((content) => content.path === path);

    if (!content) return;

    if (endSegment + 1 >= segments.length)
      return (content as RepositoryContentTree).contents;

    return this.getDir(
      (content as RepositoryContentTree).contents,
      segments,
      endSegment + 1,
    );
  }

  private addNestedContent({
    id,
    path,
    type,
    contents,
    segments,
  }: RepositoryContentTree & { segments: string[] }) {
    const dir = this.getDir(contents, segments);
    const res: RepositoryContentBlob | RepositoryContentTree = {
      id,
      path,
      type,
    };

    if (type === 'tree') (res as RepositoryContentTree).contents = [];

    if (!dir) {
      contents.push(res);
      return;
    }

    dir.push(res);
  }
}
