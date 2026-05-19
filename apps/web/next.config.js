import { env } from 'node:process';

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [{
            source: '/api/:path*',
            destination: `${env.BACKEND_URL}/:path*`
        }]
    }
};

export default nextConfig;
