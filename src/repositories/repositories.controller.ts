import { Controller, Get, Query } from '@nestjs/common';
import { RepositoryService } from './repository.service';

@Controller({ path: 'repositories', version: '1' })
export class RepositoriesController {
  constructor(private repositoryService: RepositoryService) {}

  @Get()
  async fetchRepos(@Query('status') status?: 'active' | 'inactive') {
    const data = await this.fetchReposByStatus(status);
    console.log({ data });

    return {
      status: 'success',
      data,
    };
  }

  // TODO: add runtime validation for status value
  private fetchReposByStatus(status?: 'active' | 'inactive') {
    const statusActions = {
      active: () => this.repositoryService.fetchActiveRepos(),
      inactive: () => this.repositoryService.fetchInactiveRepos(),
      default: () => this.repositoryService.fetchAllRepos(),
    };

    if (!status) return statusActions.default();

    return statusActions[status]();
  }
}
