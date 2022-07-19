import { object, string } from 'joi';

export const createUserValidator = {
  schema: object({
    email: string().email().required(),
    username: string().required(),
    password: string(),
    fullName: string(),
  }),
};
