import { Redis } from '@upstash/redis';

type Context = {
  assistantId: string;
  threadId: string;
};

const redis = Redis.fromEnv();
const normalize = (phone: string) => phone.replace(/\D/g, '');

export const getContext = async (
  phone: string,
): Promise<Context | undefined> => {
  const key = normalize(phone);
  const raw = await redis.get(key);
  if (!raw) return;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Context;
    } catch {
      return;
    }
  }
  return raw as Context;
};

export const setContext = async (phone: string, context: Context) => {
  const key = normalize(phone);
  await redis.set(key, JSON.stringify(context));
  console.log('💾 context persistido para:', key);
};
