import { CommentEntity } from './comment.model';

export class CommentSerializer {
  constructor(commentEntity: CommentEntity) {
    Object.assign(this, commentEntity);
  }
}
