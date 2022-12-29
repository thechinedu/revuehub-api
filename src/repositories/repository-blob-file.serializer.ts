import { Transform } from 'class-transformer';

import { RepositoryBlobEntity } from './repository-blob.model';

export class RepositoryBlobFileSerializer {
  @Transform(({ value }) => Buffer.from(value, 'base64').toString('utf8'))
  content: string;

  constructor(repoBlob: RepositoryBlobEntity) {
    Object.assign(this, repoBlob);
  }
}
