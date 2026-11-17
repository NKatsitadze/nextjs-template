import { describe, expect, it } from 'vitest';

import { EmailSchema } from './email';

describe('EmailSchema', () => {
  it('normalizes case and whitespace', () => {
    expect(EmailSchema.parse('  Ana@Example.COM ')).toBe('ana@example.com');
  });

  it.each(['', 'not-an-email', 'a@'])('rejects %j', (value) => {
    expect(EmailSchema.safeParse(value).success).toBe(false);
  });
});
