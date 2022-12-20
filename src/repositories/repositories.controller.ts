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

  // TODO!: Add runtime validation for path parameter
  @Post(':id/contents')
  @HttpCode(HttpStatus.NO_CONTENT)
  async AddRepoContents(
    @Req() req: RequestWithUserID,
    @Param('id') id: string,
  ) {
    await this.repositoryService.addRepoContents(req.userID, +id);
  }

  @Get('/:id/contents')
  async fetchRepoContents(@Param('id') id: string) {
    if (!id.match(/^\d+$/gi)) {
      return this.fetchRepoByName(id, 'contents');
    }

    const data = await this.repositoryService.fetchRepoContents(+id);

    return {
      status: 'success',
      data,
    };
  }

  @Get('/:owner/:repository')
  async fetchRepoByName(
    @Param('owner') owner: string,
    @Param('repository') repository: string,
  ) {
    const repoName = `${owner}/${repository}`;
    const data = await this.repositoryService.fetchRepoByName(repoName);

    return {
      status: 'success',
      data,
    };
  }

  @Get('/:repository_id/contents/:content_id')
  async fetchRepoBlobFile(
    @Req() req: RequestWithUserID,
    @Param('content_id') contentID: string,
  ) {
    const data = await this.repositoryService.fetchRepoBlobFileContents(
      req.userID,
      +contentID,
    );

    return {
      status: 'success',
      data,
    };
  }

  // TODO!: add runtime validation for status value
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
