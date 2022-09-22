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
            remotePatterns: [
                {
                    protocol: 'https',
                    hostname: 'cdnwp-s3.benzinga.com',
                },
            ],
        },
    },
};

module.exports = nextConfig;
