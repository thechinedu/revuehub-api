import { RequestWithUserID } from '@/types';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../guards/auth';
import { RepositoryService } from './repository.service';

@Controller({ path: 'repositories', version: '1' })
@UseGuards(AuthGuard)
export class RepositoriesController {
  constructor(private repositoryService: RepositoryService) {}

  @Get()
  async fetchRepos(
    @Req() req: RequestWithUserID,
    @Query('status') status?: 'active' | 'inactive',
  ) {
    const data = await this.fetchReposByStatus(req.userID, status);

    return {
      status: 'success',
      data,
    };
  }

  // TODO: add runtime validation for status value
  private fetchReposByStatus(userID: number, status?: 'active' | 'inactive') {
    const statusActions = {
      active: () => this.repositoryService.fetchActiveRepos(userID),
      inactive: () => this.repositoryService.fetchInactiveRepos(userID),
      default: () => this.repositoryService.fetchAllRepos(userID),
    };

    if (!status) return statusActions.default();

    return statusActions[status]();
  }
}
