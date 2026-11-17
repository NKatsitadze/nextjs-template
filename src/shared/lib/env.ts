import 'server-only';

import { ServerEnvSchema, type ServerEnv } from '@/shared/validations/env';

class ServerEnvManager {
  private cached: ServerEnv | null = null;

  /** Validates `process.env` on first access and fails fast with every invalid variable listed. */
  get(): ServerEnv {
    this.cached ??= this.parse();
    return this.cached;
  }

  /** Drops the cached value so the next `get()` re-reads `process.env` (used by tests). */
  reset(): void {
    this.cached = null;
  }

  private parse(): ServerEnv {
    const result = ServerEnvSchema.safeParse(process.env);
    if (result.success) return result.data;

    const problems = result.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid server environment variables:\n${problems.join('\n')}`);
  }
}

export const env = new ServerEnvManager();
