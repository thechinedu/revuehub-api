import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

import { CreateOauthStateDto } from './dto/create-oauth-state-dto';
import { CreateOauthUserDto } from './dto/create-oauth-user-dto';
import { CreateUserDto } from './dto/create-user-dto';
import { UserModel } from './user.model';

const AUTH_ENDPOINT = process.env.GITHUB_AUTH_ENDPOINT;
const OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;

@Injectable()
export class UserService {
  constructor(private userModel: UserModel) {}

  createUser(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  createOauthState(createOauthStateDto: CreateOauthStateDto) {
    return this.userModel.createOauthState(createOauthStateDto);
  }

  async createOauthUser(createOauthUserDto: CreateOauthUserDto) {
    // oauthProvider = new OAuthProvider(provider)
    // accessToken = oauthProvider.exchangeCodeForAccessToken(code)
    // if accessToken -> authorized successfully
    // else -> an error occured. return failure response
    // oauthProvider.getUserInfo(accessToken) -> { email: string, username: string }
    // oauthProvider.getAccessToken()*

    // Find oauth provider using the state value
    // Send a post request to oauth provider to exchange the code for an access token
    // With access token present, make a request to fetch the user's information
    // Save user information along with oauth access token

    const res = await fetch(
      `${process.env.GITHUB_AUTH_ENDPOINT}?client_id=${OAUTH_CLIENT_ID}&client_secret=${OAUTH_CLIENT_SECRET}&code=${createOauthUserDto.code}`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
        },
      },
    );
    const json = await res.json();
    const accessToken = json.access_token;

    return {};
  }
}
