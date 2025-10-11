import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/', // khi vào localhost:3000
        destination: '/vi/home', // chuyển hướng sang đây
        permanent: true, // true = 301, false = 302
      },
    ];
  },
};

export default withNextIntl(nextConfig);
