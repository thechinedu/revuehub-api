export type CreateUserDto = {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  profile_image_url?: string;
  email_verified?: string;
};
