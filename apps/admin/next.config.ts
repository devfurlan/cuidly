import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lganbxlccraflepgwpdu.supabase.co',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'kyejdyodmjcvooixzcxl.supabase.co',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
      },
    ],
  },
};

export default nextConfig;
