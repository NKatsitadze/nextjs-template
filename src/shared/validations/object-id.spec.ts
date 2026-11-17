import { describe, expect, it } from 'vitest';

import { ObjectIdSchema } from './object-id';

describe('ObjectIdSchema', () => {
  it.each(['507f1f77bcf86cd799439011', '507F1F77BCF86CD799439011'])('accepts %s', (value) => {
    expect(ObjectIdSchema.safeParse(value).success).toBe(true);
  });

  it.each(['', '507f1f77bcf86cd79943901', '507f1f77bcf86cd79943901z', '../etc'])('rejects %j', (value) => {
    expect(ObjectIdSchema.safeParse(value).success).toBe(false);
  });
});
