import { BaseQueue } from './base.queue';
import { userWorker } from 'src/shared/workers/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob('addAuthUserToDB', 5, userWorker.addUserToDB);
  }

  public addUserJob(name: string, data: object): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
