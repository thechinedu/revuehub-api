export type CreateUserDto = {
  email: string;
  username: string;
  password: string;
  full_name: string; // Match database case convention to keep things simple
};
