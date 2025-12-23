import createMiddleware from 'next-intl/middleware';
import {locales} from './config';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/', '/(en|zh)/:path*']
};
