import { UserAuthTokenService } from '@/src/user-auth-tokens/user-auth-token.service';
import { OAuthProviders } from '@/types';
import { getOAuthProvider } from '@/utils';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { RepositoryModel } from './repository.model';
import { RepositoryContentModel } from './repository-content.model';

const OAuthAccessTokenRevokedException = new HttpException(
  { status: 'fail', message: 'OAuth access token is no longer valid' },
  HttpStatus.UNPROCESSABLE_ENTITY,
);

@Injectable()
export class RepositoryService {
  constructor(
    private repositoryModel: RepositoryModel,
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
}
