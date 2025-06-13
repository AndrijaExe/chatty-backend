/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { postMockData, postMockRequest, postMockResponse, updatedPost, updatedPostWithImage } from 'src/mocks/post.mock';
import { postQueue } from 'src/shared/services/queues/post.queue';
import { PostCache } from 'src/shared/services/redis/post.cache';
import { Update } from '../update-post';
import { authUserPayload } from 'src/mocks/auth.mock';
import * as cloudinaryUploads from 'src/shared/globals/helpers/cloudinary-upload';
import * as postServer from 'src/shared/sockets/post';

jest.useFakeTimers();
jest.mock('src/shared/services/queues/base.queue');
jest.mock('src/shared/services/redis/post.cache');
jest.mock('src/shared/globals/helpers/cloudinary-upload');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
});

describe('Update', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('posts', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(updatedPost, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePostInCache').mockResolvedValue(postMockData);
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await Update.prototype.post(req, res);
      expect(postSpy).toHaveBeenCalledWith(`${postMockData._id}`, updatedPost);
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('update post', postMockData, 'posts');
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePostInDB', { key: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully'
      });
    });
  });

  describe('postWithImage', () => {
    it('should send correct json response if imgId and imgVersion exists', async () => {
      updatedPostWithImage.imgId = '1234';
      updatedPostWithImage.imgVersion = '1234';
      updatedPost.imgId = '1234';
      updatedPost.imgVersion = '1234';
      updatedPost.post = updatedPostWithImage.post;
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req: Request = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePostInCache');
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await Update.prototype.postWithImage(req, res);
      expect(PostCache.prototype.updatePostInCache).toHaveBeenCalledWith(`${postMockData._id}`, postSpy.mock.calls[0][1]);
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('update post', postMockData, 'posts');
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePostInDB', { key: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post with image updated successfully'
      });
    });

    it('should send correct json response if no imgId and imgVersion', async () => {
      updatedPostWithImage.imgId = '1234';
      updatedPostWithImage.imgVersion = '1234';
      updatedPost.imgId = '1234';
      updatedPost.imgVersion = '1234';
      updatedPost.post = updatedPostWithImage.post;
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req: Request = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePostInCache');
      jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await Update.prototype.postWithImage(req, res);
      expect(PostCache.prototype.updatePostInCache).toHaveBeenCalledWith(`${postMockData._id}`, postSpy.mock.calls[0][1]);
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('update post', postMockData, 'posts');
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePostInDB', { key: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post with image updated successfully'
      });
    });
  });
});
