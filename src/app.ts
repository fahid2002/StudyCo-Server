import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'StudyCo API is running' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
