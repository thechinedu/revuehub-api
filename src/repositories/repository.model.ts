import { db } from '@/db';

import { Injectable } from '@nestjs/common';

export type RepositoryEntity = {
  id: number;
  user_id: number;
  snapshot_id: number;
  node_id: string;
  name: string;
  description: string;
  default_branch: string;
  last_updated: Date;
  last_synced: Date;
  has_pulled_content: boolean;
};

type RepositoryEntityKeys = keyof RepositoryEntity;

// TODO: Move to general types
type FindArgs = {
  where: Partial<RepositoryEntity>;
  select: RepositoryEntityKeys[];
};

@Injectable()
export class RepositoryModel {
  async findAll({ where, select }: FindArgs): Promise<RepositoryEntity[]> {
    return await db('repositories').select(select).where(where);
  }
}
