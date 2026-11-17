export const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0';
export const gitHash = process.env.NEXT_PUBLIC_GIT_HASH ?? '';

export const displayVersion = `Version ${appVersion}${gitHash ? ` (${gitHash})` : ''}`;
