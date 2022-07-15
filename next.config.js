/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cloudflare-ipfs.com', 'tailwindui.com'],
  },
};

module.exports = nextConfig;
