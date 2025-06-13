import express, { Router } from 'express';
import { authMiddleware } from 'src/shared/globals/helpers/auth-middleware';
import { Create } from '../controllers/create-post';
import { Get } from '../controllers/get-post';
import { Delete } from '../controllers/delete-post';
import { Update } from '../controllers/update-post';

class PostRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/post/all/:page', authMiddleware.checkAutentication, Get.prototype.posts);
    this.router.get('/post/images/:page', authMiddleware.checkAutentication, Get.prototype.postsWithImages);

    this.router.post('/post', authMiddleware.checkAutentication, Create.prototype.post);
    this.router.post('/post/image/post', authMiddleware.checkAutentication, Create.prototype.postWithImage);

    this.router.put('/post/:postId', authMiddleware.checkAutentication, Update.prototype.post);
    this.router.put('/post/image/:postId', authMiddleware.checkAutentication, Update.prototype.postWithImage);

    this.router.delete('/post/:postId', authMiddleware.checkAutentication, Delete.prototype.post);
    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
