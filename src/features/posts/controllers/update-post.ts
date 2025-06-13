import { Request, Response } from 'express';
import { PostCache } from 'src/shared/services/redis/post.cache';
import HTTP_STATUS from 'http-status-codes';
import { postQueue } from 'src/shared/services/queues/post.queue';
import { socketIOPostObject } from 'src/shared/sockets/post';
import { joiValidation } from 'src/shared/globals/decorators/joi-validation.decorators';
import { postSchema, postWithImageSchema } from '../schemes/post.schemes';
import { IPostDocument } from '../interfaces/post.interface';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from 'src/shared/globals/helpers/cloudinary-upload';
import { BadRequestError } from 'src/shared/globals/helpers/error-handler';


const postCache: PostCache = new PostCache();

export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void>{
    Update.prototype.updatePostWithImage(req);
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully'});
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void>{
    const { imgId , imgVersion} = req.body;
    if(imgId && imgVersion){
      Update.prototype.updatePostWithImage(req);
    }else {
      const result: UploadApiResponse = await Update.prototype.addImageToExistingPost(req);
      if(!result.public_id)
      {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully'});
  }

  private async updatePostWithImage(req: Request):Promise<void>{
    const { post , bgColor , feelings , privacy , gifUrl , imgVersion , imgId , profilePicture} = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId , updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB',{key : postId , value: postUpdated});
  }

  private async addImageToExistingPost(req: Request):Promise<UploadApiResponse>{
    const { post , bgColor , feelings , privacy , gifUrl , profilePicture , image} = req.body;
    const { postId } = req.params;
    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
      if (!result?.public_id) {
        return result;
      }
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion: result.version.toString(),
      imgId: result.public_id,
      profilePicture
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId , updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB',{key : postId , value: postUpdated});
    // call imageQueue to add image to mongoDB


    return result;
  }
}
