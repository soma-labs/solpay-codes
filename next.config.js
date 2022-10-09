const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    //reactStrictMode: true,
    swcMinify: true,
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
    experimental: {
        images: {
            // TODO: Apply remote patterns for production
            remotePatterns: [
                {
                    protocol: 'https',
                    hostname: '*',
                },
            ],
        },
    },
};

module.exports = nextConfig;
