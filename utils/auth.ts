import argon2, { argon2id } from 'argon2';
import { randomBytes } from 'crypto';

type HashPasswordFn = (value: string) => Promise<string>;

// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
const hashOptions = {
  type: argon2id,
  memoryCost: 15 * 1024,
  parallelism: 1,
  timeCost: 2,
};

export const hashPassword: HashPasswordFn = async (password) =>
  await argon2.hash(password, hashOptions);

export const verifyPassword = async (passwordHash: string, password: string) =>
  await argon2.verify(passwordHash, password);

export const generateRandomToken = (desiredSize: number) =>
  randomBytes(desiredSize / 2).toString('hex');
