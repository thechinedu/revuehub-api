import { Injectable } from '@nestjs/common';
import { RepositoryModel } from './repository.model';

@Injectable()
export class RepositoryService {
  constructor(private repositoryModel: RepositoryModel) {}

  async fetchActiveRepos() {
    return await this.repositoryModel.findAll({
      where: {
        has_pulled_content: true,
      },
      select: ['id', 'name', 'description', 'last_updated'],
    });
  }

  async fetchInactiveRepos() {
    return await this.repositoryModel.findAll({
      where: {
        has_pulled_content: false,
      },
      select: ['id', 'name', 'description', 'last_updated'],
    });
  }

  async fetchAllRepos() {
    return await this.repositoryModel.findAll({
      where: {},
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
