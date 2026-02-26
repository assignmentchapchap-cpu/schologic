export function getPilotUrl(path: string = '/') {
    const isProd = process.env.NODE_ENV === 'production';
    const baseUrl = isProd ? 'https://pilot.schologic.com' : 'http://pilot.localhost:3000';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath === '/' ? '' : normalizedPath}`;
}
