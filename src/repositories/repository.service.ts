import { Injectable } from '@nestjs/common';
import { RepositoryModel } from './repository.model';

@Injectable()
export class RepositoryService {
  constructor(private repositoryModel: RepositoryModel) {}

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
    return await this.repositoryModel.findAll({
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
  }
}
