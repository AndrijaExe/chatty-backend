/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { config } from 'src/config';
import { IPostDocument, IReactions, ISavePostToCache } from 'src/features/posts/interfaces/post.interface';
import { ServerError } from 'src/shared/globals/helpers/error-handler';
import { Helpers } from 'src/shared/globals/helpers/helpers';

const log: Logger = config.createLogger('postCache');


export type PostCacheMultiType = string | number | Buffer |  IPostDocument | IPostDocument[];

export class PostCache extends BaseCache{
  constructor(){
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void>{
    const {key , currentUserId , uId , createdPost} = data;
    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount,
      imgVersion,
      imgId,
      reactions,
      createdAt

    } = createdPost;

    const dataToSave = {
      '_id': `${_id}`,
      'userId': `${userId}`,
      'username': `${username}`,
      'email': `${email}`,
      'avatarColor': `${avatarColor}`,
      'profilePicture': `${profilePicture}`,
      'post':`${post}`,
      'bgColor':`${bgColor}`,
      'feelings':`${feelings}`,
      'privacy':`${privacy}`,
      'gifUrl':`${gifUrl}`,
      'commentsCount':`${commentsCount}`,
      'reactions':JSON.stringify(reactions),
      'imgVersion':`${imgVersion}`,
      'imgId':`${imgId}`,
      'createdAt':`${createdAt}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

    const postCount = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
    const rawCount = postCount[0];
    const count = (rawCount ? parseInt(rawCount, 10) : 0) + 1;

    const multi : ReturnType<typeof this.client.multi> = this.client.multi();
    multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
    for(const [itemKey, itemValue] of Object.entries(dataToSave))
    {
        multi.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
    }

    multi.HSET(`users:${currentUserId}`, 'postsCount', count);
    await multi.exec();

    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getPostsFromCache(key: string,start: number,end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.ZRANGE(key , start , end , { REV: true });
      const multi : ReturnType<typeof this.client.multi> = this.client.multi();
      for(const value of reply)
      {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostCacheMultiType = await multi.exec() as unknown as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for(const post of replies as IPostDocument[])
      {
        post.commentsCount = Helpers.passJson(`${post.commentsCount}`) as number;
        post.reactions = Helpers.passJson(`${post.reactions}`) as IReactions;
        post.createdAt = new Date(Helpers.passJson(`${post.createdAt}`));
        postReplies.push(post);
      }

      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getTotalPostsInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCARD('post');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getPostsWithImagesFromCache(key: string,start: number,end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.ZRANGE(key , start , end , { REV: true });
      const multi : ReturnType<typeof this.client.multi> = this.client.multi();
      for(const value of reply)
      {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostCacheMultiType = await multi.exec() as unknown as PostCacheMultiType;
      const postWithImages: IPostDocument[] = [];
      for(const post of replies as IPostDocument[])
      {
        if((post.imgId && post.imgVersion) || post.gifUrl)
        {
          post.commentsCount = Helpers.passJson(`${post.commentsCount}`) as number;
          post.reactions = Helpers.passJson(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(Helpers.passJson(`${post.createdAt}`));
          postWithImages.push(post);
        }
      }
      return postWithImages;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reply: string[] = await this.client.ZRANGE(key , uId , uId , { REV: true, BY: 'SCORE' });
      const multi : ReturnType<typeof this.client.multi> = this.client.multi();
      for(const value of reply)
      {
        multi.HGETALL(`posts:${value}`);
      }
      const replies: PostCacheMultiType = await multi.exec() as unknown as PostCacheMultiType;
      const postReplies: IPostDocument[] = [];
      for(const post of replies as IPostDocument[])
      {
          post.commentsCount = Helpers.passJson(`${post.commentsCount}`) as number;
          post.reactions = Helpers.passJson(`${post.reactions}`) as IReactions;
          post.createdAt = new Date(Helpers.passJson(`${post.createdAt}`));
          postReplies.push(post);
      }
      return postReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }


  public async getTotalUserPosts(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const count: number = await this.client.ZCOUNT('post' ,uId , uId);
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }

  public async deletePostFromCache(key: string, currentUserId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi : ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM('post', `${key}`);
      multi.DEL(`posts:${key}`);
      multi.DEL(`comments:${key}`);
      multi.DEL(`reactions:${key}`);
      const rawCount = postCount[0];
      const count = (rawCount ? parseInt(rawCount, 10) : 0) - 1;
      multi.HSET(`users:${currentUserId}`, 'postsCount', count);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');

    }
  }

  public async updatePostInCache(key: string,updatedPost: IPostDocument):Promise<IPostDocument>{
    const { post , bgColor , feelings , privacy , gifUrl , imgVersion , imgId , profilePicture} = updatedPost;

    const dataToSave = {
      'post':`${post}`,
      'bgColor':`${bgColor}`,
      'feelings':`${feelings}`,
      'privacy':`${privacy}`,
      'gifUrl':`${gifUrl}`,
      'profilePicture':`${profilePicture}`,
      'imgVersion':`${imgVersion}`,
      'imgId':`${imgId}`
    };


    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      for(const [itemKey, itemValue] of Object.entries(dataToSave))
      {
        await this.client.HSET(`posts:${key}`, `${itemKey}`, `${itemValue}`);
      }
      const multi : ReturnType<typeof this.client.multi> = this.client.multi();
      multi.HGETALL(`posts:${key}`);
      const reply: PostCacheMultiType = await multi.exec() as unknown as PostCacheMultiType;
      const postReply = reply as IPostDocument[];
      postReply[0].commentsCount = Helpers.passJson(`${postReply[0].commentsCount}`) as number;
      postReply[0].reactions = Helpers.passJson(`${postReply[0].reactions}`) as IReactions;
      postReply[0].createdAt = new Date(Helpers.passJson(`${postReply[0].createdAt}`));
      return postReply[0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again');
    }
  }
}
