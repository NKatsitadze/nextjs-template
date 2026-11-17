export const BCRYPT_COST = 12;

/**
 * A valid bcrypt hash of a random value nobody knows. Comparing against it when a user does not
 * exist keeps sign-in timing identical for known and unknown emails (no account enumeration).
 */
export const DUMMY_PASSWORD_HASH = '$2b$12$jPmaqD.WVafWoP7nNicv1uEQgkrb4fCXGsNcAFEj2lAchCwJ6ZAKO';
