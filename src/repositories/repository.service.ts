import { UserAuthTokenService } from '@/src/user-auth-tokens/user-auth-token.service';
import { OAuthProviders } from '@/types';
import { getOAuthProvider } from '@/utils';
import { Injectable } from '@nestjs/common';

import { RepositoryModel } from './repository.model';

@Injectable()
export class RepositoryService {
  constructor(
    private repositoryModel: RepositoryModel,
    private userAuthTokenService: UserAuthTokenService,
  ) {}

  async fetchActiveRepos(user_id: number) {
    return await this.repositoryModel.findAll({
      where: {
        has_pulled_content: true,
        user_id,
      },
      select: ['id', 'name', 'description', 'last_updated'],
    });
  }

  async fetchInactiveRepos(user_id: number) {
    return await this.repositoryModel.findAll({
      where: {
        has_pulled_content: false,
        user_id,
      },
      select: ['id', 'name', 'description', 'last_updated'],
    });
  }

  async fetchAllRepos(user_id: number) {
    let repos = await this.repositoryModel.findAll({
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

    // TODO: get the provider from request
    // Only Github is supported for now so this is fine. If support is added for
    // other git providers in the future, this will need to change
    const {
      token,
      expires_at: expiresAt,
      is_valid: isValid,
    } = await this.userAuthTokenService.findOAuthTokenForUser(1); // TODO: make this the user_id
    // console.log({ token }, 'repo service');

    // TODO: throw an error instead. client should redirect to oauth provider auth page
    if (!token || !isValid || Date.now() > +expiresAt) return repos;

    const oauthProviderStrategy = getOAuthProvider(OAuthProviders.GITHUB);
    const providerRepoList = await oauthProviderStrategy.getUserRepos({
      token,
      user_id,
    });

    repos = await this.repositoryModel.bulkCreate(providerRepoList);

    console.log({ repos });

    // Sync with github
    // Fetch repositories for the user
    // Update db with repo list from github
    // return repo list

    return providerRepoList;
  }
}
