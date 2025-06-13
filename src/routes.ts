import { Application } from 'express';
import { authRoutes } from './features/auth/rouths/authRoutes';
import { serverAdapter } from './shared/services/queues/base.queue';
import { currentUserRouth } from './features/auth/rouths/currentRoutes';
import { authMiddleware } from './shared/globals/helpers/auth-middleware';
import { postRoutes } from './features/posts/routes/postRoutes';

const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signoutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRouth.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
  };
  routes();
};
