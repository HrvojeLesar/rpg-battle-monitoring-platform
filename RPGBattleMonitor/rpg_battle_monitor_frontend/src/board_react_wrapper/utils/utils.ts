export const ASSETS_URL_BASE = `http://${import.meta.env.VITE_BASE_URL ?? "localhost:3000"}`;

export const getUrl = (path: string) => {
    return `${ASSETS_URL_BASE}${path}`;
};
