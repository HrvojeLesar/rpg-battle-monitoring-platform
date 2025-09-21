export const ASSETS_URL_BASE = "http://localhost:3000";

export const getUrl = (path: string) => {
    return `${ASSETS_URL_BASE}${path}`;
};
