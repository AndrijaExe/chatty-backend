import { IUserDocument } from 'src/features/user/interfaces/user.interface';
import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { config } from 'src/config';
import { ServerError } from 'src/shared/globals/helpers/error-handler';
import { Helpers } from 'src/shared/globals/helpers/helpers';

const log: Logger = config.createLogger('redisUserCache');

export class UserCache extends BaseCache {
  constructor() {
    super('redisUserCache');
  }

  public async saveUserToCache(key: string, useruId: string, createdUser: IUserDocument): Promise<void> {
    //const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;
    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'postsCount',
      `${postsCount}`
    ];
    const secondList: string[] = [
      'blocked',
      JSON.stringify(blocked),
      'blockedBy',
      JSON.stringify(blockedBy),
      'profilePicture',
      `${profilePicture}`,
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      JSON.stringify(notifications),
      'social',
      JSON.stringify(social)
    ];
    const thirdList: string[] = [
      'work',
      `${work}`,
      'location',
      `${location}`,
      'school',
      `${school}`,
      'quote',
      `${quote}`,
      'bgImageId',
      `${bgImageId}`,
      'bgImageVersion',
      `${bgImageVersion}`
    ];

    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(useruId, 10), value: `${key}` }); //dodajemo usere po njihovom id-u
      await this.client.HSET(`users:${key}`, dataToSave); //omogucava da mozemo user-e da vracamo pomocu `users:1`
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const res: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
      res.createdAt = new Date(Helpers.passJson(`${res.createdAt}`));
      res.postsCount = Helpers.passJson(`${res.postsCount}`);
      res.blocked = Helpers.passJson(`${res.blocked}`);
      res.blockedBy = Helpers.passJson(`${res.blockedBy}`);
      res.notifications = Helpers.passJson(`${res.notifications}`);
      res.social = Helpers.passJson(`${res.social}`);
      res.followersCount = Helpers.passJson(`${res.followersCount}`);
      res.followingCount = Helpers.passJson(`${res.followingCount}`);

      return res;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
