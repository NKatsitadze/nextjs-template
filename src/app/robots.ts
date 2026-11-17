import { type MetadataRoute } from 'next';

import { PROTECTED_ROUTES } from '@/shared/constants/routes';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', ...PROTECTED_ROUTES] },
  };
}
