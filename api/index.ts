import { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app-setup';

let cachedServer: any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!cachedServer) {
        const expressApp = express();
        const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
        setupApp(app);
        await app.init();
        cachedServer = expressApp;
    }
    return cachedServer(req, res);
}