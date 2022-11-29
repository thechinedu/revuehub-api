import { CreateUserFromOAuthDto } from '@/src/auth/dto/create-user-from-oauth-dto';
import { CreateRepositoryDto } from '@/src/repositories/dto/create-repository-dto';
import { RepositoryContentsDto } from '@/src/repositories/dto/repository-contents-dto';
import { CreateUserDto } from '@/src/users/dto/create-user-dto';
import { ObjectSchema, ValidationErrorItem } from 'joi';
import { Request } from 'express';

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

export type UserInfoOptions = CreateUserFromOAuthDto;
type GetUserInfoRet = Promise<{
  data: CreateUserDto;
  token: string;
} | null>;

export type UserReposOptions = {
  token: string;
  user_id: number;
};
type GetUserReposRet = Promise<CreateRepositoryDto[] | null>;

export type RepoContentsOptions = {
  token: string;
  owner: string;
  repo: string;
  tree_sha: string;
  repository_id: number;
};
type GetRepoContentsRet = Promise<RepositoryContentsDto[] | null>;

export type OAuthProviderStrategy = {
  getUserInfo: (userInfoOptions: UserInfoOptions) => GetUserInfoRet;
  getUserRepos: (userReposOptions: UserReposOptions) => GetUserReposRet;
  getRepoContents: (
    repoContentsOptions: RepoContentsOptions,
  ) => GetRepoContentsRet;
};

export enum AuthTokenType {
  OAUTH_TOKEN = 'OAUTH_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export type Validator<T = any> = {
  schema: ObjectSchema<T>;
  beforeValidate?: (value: T) => Promise<T>;
  afterValidate?: (value: T) => Promise<T>;
  serializeValidationMessages: (errorDetails: ValidationErrorItem[]) => any;
};

export type RequestWithUserID = Request & { userID: number };
