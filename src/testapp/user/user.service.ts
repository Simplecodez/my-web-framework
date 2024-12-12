import { singleton } from 'tsyringe';
import {
  NextFunction,
  Request,
  Response
} from '../../core/interfaces/middleware.interface';
import axios from 'axios';
import https, { request } from 'https';

@singleton()
export class UserService {
  private instance = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 60000, //optional
    httpsAgent: new https.Agent({ keepAlive: true, keepAliveMsecs: 50000 }),
    headers: { 'Content-Type': 'application/json' }
  });
  constructor() {}

  getUser() {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const response = await this.instance.get('/posts/1');
      request('');

      res.status(200).json(response.data);
    });
  }
}

export const catchAsync = (
  func: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    func(req, res, next).catch(next);
  };
};
