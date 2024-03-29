import { db } from '@/db';
import { BATCH_INSERT_CHUNK_SIZE } from '@/utils/oauth';
import { Injectable } from '@nestjs/common';

import { CreateRepositoryContentsDto } from './dto/create-repository-contents-dto';

export type RepositoryContentEntity = {
  id: number;
  repository_id: number;
  type: string;
  path: string;
  sha: string;
};

type RepositoryContentEntityKeys = keyof RepositoryContentEntity;

// TODO: Move to general types
type FindArgs = {
  where: Partial<RepositoryContentEntity>;
  select: RepositoryContentEntityKeys[];
};

@Injectable()
export class RepositoryContentModel {
  async findAll({
    where,
    select,
  }: FindArgs): Promise<RepositoryContentEntity[]> {
    return db('repository_contents')
      .select(select)
      .where(where)
      .orderBy('type', 'desc')
      .orderBy('id', 'asc');
  }

  async find({
    where,
    select,
  }: FindArgs): Promise<RepositoryContentEntity | undefined> {
    return db('repository_contents').select(select).where(where).first();
  }

  async bulkCreate(items: CreateRepositoryContentsDto[]) {
    return db.transaction(async (trx) => {
      await trx.batchInsert(
        'repository_contents',
        items,
        BATCH_INSERT_CHUNK_SIZE,
      );

      const { repository_id: id } = items[0];

      await trx('repositories')
        .where({ id })
        .update({
          has_pulled_content: true,
          last_synced: new Date(Date.now()),
        });
    });
  }
}
