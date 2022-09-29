import { memoryStore } from '@/db';
import { generateRandomToken } from '../auth';

export const generateOAuthState = async (): Promise<string> => {
  const memoryStoreClient = await memoryStore;
  const state = generateRandomToken(32);

  const keyExists = Boolean(await memoryStoreClient.exists(state));

  if (keyExists) return generateOAuthState();

  return state;
};
