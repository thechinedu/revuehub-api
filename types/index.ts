import { CreateOauthUserDto } from '@/src/users/dto/create-oauth-user-dto';
import { CreateUserDto } from '@/src/users/dto/create-user-dto';

// TODO: error responses (5xx errors) are currently handled by nestjs. The structure
// of the response object doesn't match this type.
// Set up the required custom functionality to handle 5xx errors
export type Response<T> = {
  status: 'error' | 'fail' | 'success';
  data: T;
  message?: string;
};

export enum OAuthProviders {
  GITHUB = 'github',
}

type UserInfoOptions = CreateOauthUserDto;
type GetUserInfoRet = Promise<{
  data: CreateUserDto;
  token: string;
} | null>;

export type OAuthProviderStrategy = {
  getUserInfo: (userInfoOptions: UserInfoOptions) => GetUserInfoRet;
};
