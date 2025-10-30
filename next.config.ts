import createNextIntlPlugin from 'next-intl/plugin';
import { NextConfig } from 'next';
const withNextIntl = createNextIntlPlugin();

const nextConfig : NextConfig= {
  images: {
    remotePatterns: [
      {
        hostname: 'picsum.photos',
        port: '',
        protocol: 'https',
      }
    ],
  },
};

export default withNextIntl(nextConfig);
