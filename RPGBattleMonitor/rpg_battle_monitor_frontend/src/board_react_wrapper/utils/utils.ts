export const ASSETS_URL_BASE = `http://${import.meta.env.BASE_URL ?? "192.168.1.7:3000"}`;

export const getUrl = (path: string) => {
    return `${ASSETS_URL_BASE}${path}`;
};
