import { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/main';

let cachedApp: any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!cachedApp) {
        const app = await createApp();
        cachedApp = app;
    }
    return cachedApp(req, res);
}