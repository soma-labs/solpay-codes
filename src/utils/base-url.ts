export default function getUrlWithBase(path: string): string {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'local') {
        return `${process.env.NEXT_PUBLIC_VERCEL_URL}${path}`;
    }

    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'dev') {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}${path}`;
    }

    return `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}${path}`;
}
