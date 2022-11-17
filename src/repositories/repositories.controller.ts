import { RequestWithUserID } from '@/types';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

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

  @Post(':id/contents')
  @HttpCode(HttpStatus.NO_CONTENT)
  async AddRepoContents(
    @Req() req: RequestWithUserID,
    @Param('id') id: string,
  ) {
    // await this.repositoryService.addRepoContents(req.userID, +id);
    await this.repositoryService.addRepoContents(1, +id);
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
