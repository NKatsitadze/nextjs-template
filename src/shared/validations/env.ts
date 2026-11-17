import { z } from 'zod';

// `.env` files turn unset values into empty strings; treat those as "not provided".
const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const RedisSentinelsSchema = z
  .string()
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({ code: 'custom', message: 'must be a JSON array of { host, port }' });
      return z.NEVER;
    }
  })
  .pipe(z.array(z.object({ host: z.string().min(1), port: z.coerce.number().int().positive() })));

export const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.url(),
  JWT_SECRET: z.string().min(32, 'must be at least 32 characters (openssl rand -hex 32)'),
  MONGO_URL: z.string().min(1),
  MONGO_DB_NAME: z.string().min(1),
  MONGO_USER: optionalString,
  MONGO_PASSWORD: optionalString,
  REDIS_HOST: z.preprocess(emptyToUndefined, z.string().default('localhost')),
  REDIS_PORT: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(6379)),
  REDIS_USER: optionalString,
  REDIS_PASSWORD: optionalString,
  REDIS_SENTINELS: z.preprocess(emptyToUndefined, RedisSentinelsSchema.optional()),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
