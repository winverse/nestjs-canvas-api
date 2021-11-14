import redis from 'redis';

const redisClient = redis.createClient();

const JSONparse = str => JSON.parse(str);
const JSONstrigify = data => JSON.stringify(data);

export const redisGet = <T>(key: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, reply) => {
      if (err) {
        reject(err);
      }
      const result: T = JSONparse(reply);
      resolve(result);
    });
  });
};

export const redisSet = (key: string, data): Promise<void> => {
  return new Promise((resolve, reject) => {
    const setData = JSONstrigify(data);
    redisClient.set(key, setData, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};
export default redisClient;
