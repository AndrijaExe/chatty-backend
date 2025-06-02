import mongoose from 'mongoose';
import { config } from './config';
import Logger from 'bunyan';
import { redisConnection } from './shared/services/redis/redis.connection';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
  //ako koristimo export default mozemo kasnije pozivati sa bilo kojim imenom
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`) //27017 je standardni port za mongodb
      .then(() => {
        log.info('Succesfully connected to db.');
        redisConnection.connect();
      })
      .catch((error) => {
        log.error('Error connecting to db ', error);
        return process.exit(1);
      });
  };
  connect();
  mongoose.connection.on('disconnected', connect); //ako nije konektovan on ce pokusati opet
};
