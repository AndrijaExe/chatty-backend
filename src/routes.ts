import { Application } from 'express';
import { authRoutes } from './features/auth/rouths/authRoutes';

const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routes = () => {
    app.use(BASE_PATH,authRoutes.routes());
  };
  routes();
};
