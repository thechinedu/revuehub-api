import { AuthTokenType } from '@/types';

export type CreateAuthTokenDto = {
  userID: number;
  type: AuthTokenType;
  token?: string;
};
