import { db } from '@/db';
import { Injectable } from '@nestjs/common';

import { CreateRepositoryBlobDto } from './dto/create-repository-blob-dto';

export type RepositoryBlobEntity = {
  id: number;
  repository_content_id: number;
  content: string;
};

type RepositoryBlobEntityKeys = keyof RepositoryBlobEntity;

// TODO: Move to general types
type FindArgs = {
  where: Partial<RepositoryBlobEntity>;
  select: RepositoryBlobEntityKeys[];
};

@Injectable()
export class RepositoryBlobModel {
  async create({
    repository_content_id,
    content,
  }: CreateRepositoryBlobDto): Promise<RepositoryBlobEntity> {
    return (
      await db('repository_blobs')
        .insert({ repository_content_id, content })
        .returning('content')
    )[0];
  }

  async find({
    where,
    select,
  }: FindArgs): Promise<RepositoryBlobEntity | undefined> {
    return (await db('repository_blobs').select(select).where(where))[0];
  }
}
