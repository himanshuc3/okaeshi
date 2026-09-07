import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import logger from 'jet-logger';
import morgan from 'morgan';
import path from 'path';

import Paths from '@src/common/constants/Paths';
import { RouteError } from '@src/common/utils/route-errors';
import BaseRouter from '@src/routes/apiRouter';

import EnvVars, { NodeEnvs } from './common/constants/env';
import {
  getDependencyGraphs,
  getGithubRepositories,
  getGithubUser,
  GithubApiError,
} from './services/github-service';

/******************************************************************************
                                Setup
******************************************************************************/

const app = express();

// **** Middleware **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'https://himanshuc3.github.io' }));

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.DEV) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.PRODUCTION) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use(Paths._, BaseRouter);

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (EnvVars.NodeEnv !== NodeEnvs.TEST.valueOf()) {
    logger.err(err, true);
  }
  if (err instanceof RouteError) {
    res.status(err.status).json({ error: err.message });
  }
  return next(err);
});

// **** FrontEnd Content **** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Nav to users pg by default
app.get('/', (_: Request, res: Response) => {
  return res.redirect('/users');
});

app.get('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  const username = req.query.username;
  const token = String(EnvVars.GithubApiToken ?? '').trim();

  if (typeof username !== 'string' || username.trim() === '') {
    return res
      .status(400)
      .json({ error: 'A username query parameter is required.' });
  }
  if (!token) {
    return res.status(500).json({ error: 'Request not authorized' });
  }

  try {
    const normalizedUsername = username.trim();
    const [user, repositories] = await Promise.all([
      getGithubUser(normalizedUsername, token),
      getGithubRepositories(normalizedUsername, token),
    ]);
    const dependencyGraphs = await getDependencyGraphs(repositories, token);

    return res.json({ user, repositories, dependencyGraphs });
  } catch (error) {
    if (error instanceof GithubApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return next(error);
  }
});

// Redirect to login if not logged in.
app.get('/users', (_: Request, res: Response) => {
  return res.sendFile('users.html', { root: viewsDir });
});

/******************************************************************************
                                Export default
******************************************************************************/

export default app;
